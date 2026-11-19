
import { useEffect, useState } from "react";
import {
  startCall as createCall,
  saveStage as saveCallStage,
  closeCall as finishCall,
  getCalls,
} from "./api";
import { stages, callOutcomes } from "./data/stages";
import "./App.css";

function mapCallFromApi(call) {
  const entries = (call.call_stages || [])
    .map((stage) => ({
      stageNumber: stage.stage_number,
      stageName: stage.stage_name,
      result: stage.result || "",
      prospectWords: stage.prospect_words || "",
      completedAt: stage.completed_at,
    }))
    .sort((a, b) => a.stageNumber - b.stageNumber);

  return {
    id: call.id,
    prospect: call.prospect_name,
    company: call.company_name,
    phone: call.phone || "",
    startedAt: call.started_at,
    entries,
    lastStage: call.last_stage_reached || 1,
    outcome: call.outcome || "",
    aiSummary: call.ai_summary || "",
    closedAt: call.closed_at,
  };
}

function App() {
  const [page, setPage] = useState("live");
  const [calls, setCalls] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [prospect, setProspect] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [stageIndex, setStageIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [words, setWords] = useState("");
  const [showOutcome, setShowOutcome] = useState(false);
  const [finalOutcome, setFinalOutcome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function refreshCalls() {
    const savedCalls = await getCalls();
    setCalls(savedCalls.map(mapCallFromApi));
  }

  useEffect(() => {
    refreshCalls().catch((err) => {
      setError(`Could not load call history: ${err.message}`);
    });
  }, []);

  const currentStage = stages[stageIndex];
  const completedCalls = calls.filter((call) => call.outcome).length;
  const activeCalls = calls.filter((call) => !call.outcome).length;

  // Derived history information. No additional API calls or React state.
  const sortedCalls = [...calls].sort(
    (a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0)
  );

  const stageReachCounts = stages.map(
    (stage) =>
      calls.filter((call) => call.lastStage >= stage.number).length
  );

  const highestStageCount = Math.max(1, ...stageReachCounts);

  const stageEndCounts = stages.map(
    (stage) =>
      calls.filter((call) => call.lastStage === stage.number).length
  );

  const mostCommonStageIndex = stageEndCounts.reduce(
    (bestIndex, count, index, allCounts) =>
      count > allCounts[bestIndex] ? index : bestIndex,
    0
  );

  const mostCommonStage = stages[mostCommonStageIndex];

  async function handleStartCall(event) {
    event.preventDefault();

    if (!prospect.trim() || !company.trim()) {
      setError("Please enter the prospect's name and company.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const savedCall = await createCall({
        prospect_name: prospect.trim(),
        company_name: company.trim(),
        phone: phone.trim(),
      });

      setActiveCall(mapCallFromApi(savedCall));
      setStageIndex(0);
      setSelected("");
      setWords("");
      setShowOutcome(false);
      setFinalOutcome("");
    } catch (err) {
      setError(`Could not start the call: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveStage() {
    if (!selected) {
      setError("Please select an outcome before continuing.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const savedStage = await saveCallStage(activeCall.id, {
        stage_number: currentStage.number,
        stage_name: currentStage.name,
        result: selected,
        prospect_words: words.trim(),
      });

      const entry = {
        stageNumber: savedStage.stage_number,
        stageName: savedStage.stage_name,
        result: savedStage.result || "",
        prospectWords: savedStage.prospect_words || "",
        completedAt: savedStage.completed_at,
      };

      setActiveCall((previous) => ({
        ...previous,
        entries: [
          ...previous.entries.filter(
            (item) => item.stageNumber !== entry.stageNumber
          ),
          entry,
        ].sort((a, b) => a.stageNumber - b.stageNumber),
        lastStage: Math.max(previous.lastStage, entry.stageNumber),
      }));

      if (stageIndex < stages.length - 1) {
        setStageIndex((previous) => previous + 1);
        setSelected("");
        setWords("");
      } else {
        setShowOutcome(true);
      }

      await refreshCalls();
    } catch (err) {
      setError(`Could not save this stage: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function goToStage(index) {
    const existing = activeCall.entries.find(
      (item) => item.stageNumber === stages[index].number
    );

    setStageIndex(index);
    setSelected(existing?.result || "");
    setWords(existing?.prospectWords || "");
    setShowOutcome(false);
    setError("");
  }

  async function handleCloseCall() {
    if (!finalOutcome) {
      setError("Please select the final call outcome.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await finishCall(activeCall.id, finalOutcome);
      await refreshCalls();

      setActiveCall(null);
      setProspect("");
      setCompany("");
      setPhone("");
      setStageIndex(0);
      setSelected("");
      setWords("");
      setShowOutcome(false);
      setFinalOutcome("");
      setPage("history");
    } catch (err) {
      setError(`Could not finish the call: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function renderHistoryCard(call) {
    return (
      <article className="history-card" key={call.id}>
        <div className="history-top-row">
          <div className="history-person">
            <h3>{call.prospect}</h3>
            <p>{call.company}</p>
          </div>

          <time className="history-date">
            {formatDate(call.startedAt)}
          </time>
        </div>

        <div className="history-meta">
          <span className="stage-tag">
            Stage {call.lastStage} of 8
          </span>

          <span
            className={
              call.outcome
                ? "outcome-tag"
                : "outcome-tag in-progress"
            }
          >
            {call.outcome || "Call in progress"}
          </span>

          <small>{call.entries.length} stages saved</small>
        </div>

        {call.aiSummary && (
          <div className="ai-summary">
            <strong>✦ AI Call Summary</strong>
            <p>{call.aiSummary}</p>
          </div>
        )}
      </article>
    );
  }

  return (
    <div className="app redesigned-app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">M</div>
          <div className="brand-copy">
            <h1>Meridian Growth Partners</h1>
            <p>Business development workspace</p>
          </div>
        </div>

        <nav>
          <button
            className={page === "live" ? "nav-button active" : "nav-button"}
            onClick={() => setPage("live")}
          >
            <span aria-hidden="true">◉</span>
            <span>Live workspace</span>
          </button>

          <button
            className={page === "history" ? "nav-button active" : "nav-button"}
            onClick={async () => {
              setPage("history");
              try {
                await refreshCalls();
                setError("");
              } catch (err) {
                setError(`Could not load call history: ${err.message}`);
              }
            }}
          >
            <span aria-hidden="true">▤</span>
            <span>Call history</span>
            <span className="nav-count">{calls.length}</span>
          </button>
        </nav>
      </header>

      <main className="main redesigned-main">
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {page === "history" ? (
          <section className="history-page">
            <div className="page-intro">
              <div>
                <p className="eyebrow">WORKSPACE / RECORDS</p>
                <h2>Call history</h2>
                <p className="muted">
                  Your conversations, progress and AI-generated summaries.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={() => setPage("live")}
              >
                + Start a new call
              </button>
            </div>

            <section className="history-analytics">
              <div className="history-analytics-heading">
                <strong>
                  {calls.length === 0
                    ? "No calls recorded yet"
                    : `Most calls end at stage ${mostCommonStage.number}: ${mostCommonStage.name}`}
                </strong>
                <span>{calls.length} calls analysed</span>
              </div>

              <div
                className="stage-bars"
                aria-label="Number of calls reaching each stage"
              >
                {stages.map((stage, index) => (
                  <div className="stage-bar-item" key={stage.number}>
                    <div className="stage-bar-track">
                      <div
                        className="stage-bar-fill"
                        style={{
                          height: `${
                            (stageReachCounts[index] / highestStageCount) * 100
                          }%`,
                        }}
                        title={`${stageReachCounts[index]} calls reached ${stage.name}`}
                      />
                    </div>
                    <span>{stage.number}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="content-card">
              <div className="content-card-heading">
                <div>
                  <h3>All conversations</h3>
                  <p>Review your saved prospect interactions.</p>
                </div>
                <span className="record-count">{calls.length} records</span>
              </div>

              {sortedCalls.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">◷</div>
                  <h3>No calls recorded yet</h3>
                  <p>Your saved calls will appear here.</p>
                  <button
                    className="primary-button"
                    onClick={() => setPage("live")}
                  >
                    Start your first call
                  </button>
                </div>
              ) : (
                <>
                  <div className="history-list">
                    {sortedCalls.slice(0, 15).map(renderHistoryCard)}
                  </div>

                  {sortedCalls.length > 15 && (
                    <details className="history-show-more">
                      <summary>
                        Show more ({sortedCalls.length - 15} older calls)
                      </summary>
                      <div className="history-list history-older-list">
                        {sortedCalls.slice(15).map(renderHistoryCard)}
                      </div>
                    </details>
                  )}
                </>
              )}
            </section>
          </section>
        ) : !activeCall ? (
          <section className="dashboard-page">
            <div className="dashboard-welcome">
              <div className="welcome-copy">
                <p className="eyebrow">YOUR BUSINESS DEVELOPMENT HUB</p>
                <h2>Good conversations create great opportunities.</h2>
                <p>
                  Manage your prospect conversations, follow a clear calling
                  process and keep every important detail in one place.
                </p>

                <button
                  className="primary-button welcome-action"
                  onClick={() =>
                    document.getElementById("start-call-form")?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    })
                  }
                >
                  Start a conversation <span>→</span>
                </button>
              </div>

              <div className="welcome-visual" aria-hidden="true">
                <div className="visual-orbit orbit-one" />
                <div className="visual-orbit orbit-two" />
                <div className="visual-center">M</div>
              </div>
            </div>

            <div className="dashboard-stats">
              <div className="stat-card">
                <span className="stat-icon">▤</span>
                <div>
                  <p>Total calls</p>
                  <strong>{calls.length}</strong>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon green">✓</span>
                <div>
                  <p>Completed calls</p>
                  <strong>{completedCalls}</strong>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon amber">◷</span>
                <div>
                  <p>In progress</p>
                  <strong>{activeCalls}</strong>
                </div>
              </div>
            </div>

            <div className="dashboard-content">
              <section className="content-card process-card">
                <div className="content-card-heading">
                  <div>
                    <p className="eyebrow">YOUR PROCESS</p>
                    <h3>Eight stages. One clear conversation.</h3>
                    <p>Stay organised from the opening to the next step.</p>
                  </div>
                </div>

                <div className="process-steps">
                  {stages.map((stage) => (
                    <div className="process-step" key={stage.number}>
                      <span>{String(stage.number).padStart(2, "0")}</span>
                      <p>{stage.name}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className="content-card start-panel"
                id="start-call-form"
              >
                <div className="content-card-heading">
                  <div>
                    <p className="eyebrow">NEW CONVERSATION</p>
                    <h3>Start a new call</h3>
                    <p>Enter your prospect's details to get started.</p>
                  </div>
                  <span className="form-heading-icon">＋</span>
                </div>

                <form onSubmit={handleStartCall}>
                  <label htmlFor="prospect">Prospect name *</label>
                  <input
                    id="prospect"
                    value={prospect}
                    onChange={(event) => setProspect(event.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                  />

                  <label htmlFor="company">Company name *</label>
                  <input
                    id="company"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="e.g. Sunrise Industries"
                    required
                  />

                  <label htmlFor="phone">Phone number (optional)</label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Enter phone number"
                  />

                  <button
                    className="primary-button full-button"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Starting..." : "Start call"}
                    <span>→</span>
                  </button>
                </form>
              </section>
            </div>
          </section>
        ) : showOutcome ? (
          <section className="content-card outcome-panel">
            <div className="success-icon">✓</div>
            <p className="eyebrow">CONVERSATION COMPLETE</p>
            <h2>How did the call go?</h2>
            <p className="muted">
              Select the final outcome for {activeCall.prospect} at{" "}
              {activeCall.company}.
            </p>

            <div className="outcome-options">
              {callOutcomes.map((outcome) => (
                <button
                  key={outcome}
                  className={
                    finalOutcome === outcome
                      ? "outcome-option selected"
                      : "outcome-option"
                  }
                  onClick={() => setFinalOutcome(outcome)}
                >
                  {outcome}
                </button>
              ))}
            </div>

            <div className="action-row">
              <button
                className="secondary-button"
                onClick={() => goToStage(7)}
                disabled={loading}
              >
                Back to stage 8
              </button>

              <button
                className="primary-button"
                onClick={handleCloseCall}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save and finish call"}
              </button>
            </div>
          </section>
        ) : (
          <section className="live-workspace">
            <div className="live-heading">
              <div>
                <p className="eyebrow">LIVE CALL WORKSPACE</p>
                <h2>Conversation in progress</h2>
                <p className="muted">
                  Work through each stage and record what matters.
                </p>
              </div>

              <button
                className="end-button"
                onClick={() => {
                  setShowOutcome(true);
                  setError("");
                }}
                disabled={loading}
              >
                End call
              </button>
            </div>

            <div className="prospect-banner">
              <div className="prospect-avatar">
                {(activeCall.prospect || "?").charAt(0).toUpperCase()}
              </div>

              <div className="prospect-details">
                <span>YOU ARE SPEAKING WITH</span>
                <h3>{activeCall.prospect}</h3>
                <p>
                  {activeCall.company}
                  {activeCall.phone ? ` · ${activeCall.phone}` : ""}
                </p>
              </div>

              <div className="prospect-status">
                <span className="live-dot" />
                Live conversation
              </div>
            </div>

            <div className="live-progress-card">
              <div className="progress-label">
                <span>YOUR CALLING JOURNEY</span>
                <strong>Stage {currentStage.number} of 8</strong>
              </div>

              <div
                className="progress-segments"
                role="progressbar"
                aria-label="Call stage progress"
                aria-valuemin={0}
                aria-valuemax={8}
                aria-valuenow={activeCall.entries.length}
              >
                {stages.map((stage) => {
                  const completed = activeCall.entries.some(
                    (entry) => entry.stageNumber === stage.number
                  );

                  return (
                    <span
                      key={stage.number}
                      className={
                        completed
                          ? "progress-segment filled"
                          : "progress-segment"
                      }
                    />
                  );
                })}
              </div>
            </div>

            <div className="stage-layout">
              <aside className="stage-sidebar">
                <p className="eyebrow">CONVERSATION FLOW</p>

                <div className="stage-nav-list">
                  {stages.map((stage, index) => {
                    const completed = activeCall.entries.some(
                      (entry) => entry.stageNumber === stage.number
                    );

                    return (
                      <button
                        key={stage.number}
                        className={
                          index === stageIndex
                            ? "stage-nav current"
                            : completed
                              ? "stage-nav completed"
                              : "stage-nav"
                        }
                        onClick={() => goToStage(index)}
                        disabled={loading}
                      >
                        <span className="stage-number">
                          {completed ? "✓" : stage.number}
                        </span>
                        <span>{stage.name}</span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <div className="panel stage-panel">
                <div className="stage-title-row">
                  <div>
                    <h2>{currentStage.name}</h2>
                  </div>

                  <span className="stage-count">
                    Stage {currentStage.number} of 8
                  </span>
                </div>

                <div className="purpose-box">
                  <strong>✦ Stage objective</strong>
                  <p>{currentStage.purpose}</p>
                </div>

                <div className="examples-section">
                  <h3>They may say</h3>
                  <p className="muted">
                    Listen for the prospect's response. These are examples,
                    not a script.
                  </p>

                  <div className="example-list">
                    {currentStage.examples.map((example) => (
                      <div className="example-item" key={example}>
                        “{example}”
                      </div>
                    ))}
                  </div>
                </div>

                {currentStage.number === 5 && (
                  <div className="purpose-box stage-focus-box">
                    <strong>✦ Listen closely — this stage matters</strong>
                    <p>
                      Capture the prospect's exact words about their goals,
                      challenges or constraints. Don't replace their words
                      with your own interpretation.
                    </p>
                  </div>
                )}

                {currentStage.number === 7 && (
                  <div className="purpose-box stage-focus-box">
                    <strong>✦ Make the next step specific</strong>
                    <p>
                      Record what was agreed, who will act, and the exact
                      date, time or channel for the follow-up.
                    </p>
                  </div>
                )}

                <div className="selection-section">
                  <h3>What happened?</h3>
                  <p className="muted">
                    Choose the response that best describes the conversation.
                  </p>

                  <div className="outcome-grid">
                    {currentStage.outcomes.map((outcome) => (
                      <button
                        key={outcome}
                        className={
                          selected === outcome
                            ? "choice-button chosen"
                            : "choice-button"
                        }
                        onClick={() => setSelected(outcome)}
                        disabled={loading}
                      >
                        {outcome}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="notes-section">
                  <label htmlFor="prospectWords">
                    {currentStage.number === 5
                      ? "Prospect's exact words"
                      : currentStage.number === 7
                        ? "Agreed next step and follow-up details"
                        : "Prospect's words"}
                    <span> (optional)</span>
                  </label>

                  <textarea
                    id="prospectWords"
                    value={words}
                    onChange={(event) => setWords(event.target.value)}
                    placeholder={
                      currentStage.number === 5
                        ? "Write what the prospect actually said about their goals or challenges..."
                        : currentStage.number === 7
                          ? "Example: Send the report by email and call again Tuesday at 11 AM..."
                          : "Capture their exact words or an important detail..."
                    }
                    rows="3"
                    disabled={loading}
                  />
                </div>

                <div className="action-row">
                  <button
                    className="secondary-button"
                    onClick={() => goToStage(Math.max(0, stageIndex - 1))}
                    disabled={stageIndex === 0 || loading}
                  >
                    ← Previous stage
                  </button>

                  <button
                    className="primary-button"
                    onClick={handleSaveStage}
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : stageIndex === stages.length - 1
                        ? "Complete stages"
                        : "Save and continue →"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <strong>MERIDIAN GROWTH PARTNERS</strong>
        <span> · Caller workspace</span>
      </footer>
    </div>
  );
}

export default App;