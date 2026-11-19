
import { supabase } from "./supabase";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

async function request(path, options = {}) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error("Could not verify your login session.");
  }

  if (!session) {
    throw new Error("Please sign in before using the caller workspace.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export async function startCall(callDetails) {
  const data = await request("/calls", {
    method: "POST",
    body: JSON.stringify(callDetails),
  });

  return data.call;
}

export async function saveStage(callId, stageDetails) {
  const data = await request(`/calls/${callId}/stages`, {
    method: "POST",
    body: JSON.stringify(stageDetails),
  });

  return data.stage;
}

export async function closeCall(callId, outcome) {
  const data = await request(`/calls/${callId}/close`, {
    method: "POST",
    body: JSON.stringify({ outcome }),
  });

  return data.call;
}

export async function getCalls() {
  const data = await request("/calls");

  console.log("CALL HISTORY API RESPONSE:", data);
  console.log("NUMBER OF CALLS:", data.calls?.length);

  return data.calls || [];
}

export async function getCall(callId) {
  const data = await request(`/calls/${callId}`);
  return data.call;
}
