
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./Auth.css";

export default function Auth({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) setError(error.message);
      setSession(data?.session || null);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  async function handleSignup() {
    setError("");
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMessage(
        "Account created. Check your email if confirmation is required."
      );
      setLoading(false);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
  }

  if (loading) {
    return <div className="auth-loading">Loading...</div>;
  }

  if (session) {
    return (
      <>
        <div className="auth-user-bar">
          <span>{session.user.email}</span>
          <button onClick={handleLogout}>Sign out</button>
        </div>
        {children}
      </>
    );
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleLogin}>
        <div className="auth-logo">M</div>
        <p className="auth-eyebrow">MERIDIAN GROWTH PARTNERS</p>
        <h1>Welcome back</h1>
        <p className="auth-description">
          Sign in to access your caller workspace.
        </p>

        <label htmlFor="auth-email">Email address</label>
        <input
          id="auth-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />

        <label htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
          minLength={6}
        />

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-message">{message}</p>}

        <button type="submit" disabled={loading}>
          Sign in
        </button>

        <button
          type="button"
          className="auth-signup"
          onClick={handleSignup}
          disabled={loading}
        >
          Create an account
        </button>
      </form>
    </main>
  );
}
