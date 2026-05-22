const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");

const buildUrl = (endpoint) => `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

const parseError = async (response) => {
  try {
    const payload = await response.json();
    return payload?.error || payload?.message || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
};

const request = async (endpoint, options = {}) => {
  const response = await fetch(buildUrl(endpoint), options);
  console.log(`[API] ${options.method || "GET"} ${buildUrl(endpoint)} -> ${response.status}`);

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

export const api = {
  login: (payload) =>
    request("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    }),

  register: (payload) =>
    request("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    }),

  chat: (payload) =>
    request("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  recommend: (formData) =>
    request("/recommend", {
      method: "POST",
      body: formData,
    }),

  getData: (payload) =>
    request("/get_data", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    }),

  upload: (formData) =>
    request("/upload", {
      method: "POST",
      body: formData,
    }),
};

export { API_BASE_URL };
