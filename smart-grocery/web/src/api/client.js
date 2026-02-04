const API_BASE = "";

function buildUrl(path) {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${API_BASE}${path}`;
}

export async function apiRequest(path, { method = "GET", token, body } = {}) {
  const headers = { Accept: "application/json" };

  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(buildUrl(path), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const msg =
      (data && data.error && data.error.message) ||
      (typeof data === "string" ? data : null) ||
      `Request failed (${res.status})`;

    const details = (data && data.error && data.error.details) || null;
    const code = (data && data.error && data.error.code) || "HTTP_ERROR";

    const err = new Error(msg);
    err.code = code;
    err.status = res.status;
    err.details = details;
    throw err;
  }

  return data;
}
