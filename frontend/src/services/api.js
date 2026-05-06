const API_URL = process.env.REACT_APP_API_URL?.replace(/\/$/, "");

const ensureApiUrl = () => {
  if (!API_URL) {
    throw new Error("REACT_APP_API_URL is not configured");
  }

  return API_URL;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseResponse = async (res) => {
  const rawBody = await res.text();

  let json = {};
  try {
    json = rawBody ? JSON.parse(rawBody) : {};
  } catch (error) {
    console.error("API PARSE ERROR:", {
      url: res.url,
      status: res.status,
      rawBody,
      error,
    });
    throw new Error("Invalid server response");
  }

  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || "Request failed");
  }

  return json?.data ?? json;
};

export const registerUser = async (data) => {
  try {
    const res = await fetch(`${ensureApiUrl()}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await parseResponse(res);
  } catch (err) {
    return { error: err.message || "Server error" };
  }
};

export const loginUser = async (data) => {
  const res = await fetch(`${ensureApiUrl()}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return parseResponse(res);
};

export const uploadResume = async (formData) => {
  const res = await fetch(`${ensureApiUrl()}/upload`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  return parseResponse(res);
};

export const quickAnalyzeResume = async (formData) => {
  const res = await fetch(`${ensureApiUrl()}/quick-analyze`, {
    method: "POST",
    body: formData,
  });

  return parseResponse(res);
};

export const fetchHistory = async () => {
  const res = await fetch(`${ensureApiUrl()}/history`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return parseResponse(res);
};

export const generateResumeBuilder = async (payload) => {
  const res = await fetch(`${ensureApiUrl()}/resume-builder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
};

export const fetchLatestProfile = async () => {
  const res = await fetch(`${ensureApiUrl()}/profile/latest`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  return parseResponse(res);
};

export const saveLatestProfile = async (payload) => {
  const res = await fetch(`${ensureApiUrl()}/profile/latest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
};

export const rewriteBulletApi = async (payload) => {
  const requestUrl = `${ensureApiUrl()}/rewrite-bullet`;

  const res = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
};

export const compareResumesApi = async (formData) => {
  const res = await fetch(`${ensureApiUrl()}/compare`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });
  return parseResponse(res);
};
