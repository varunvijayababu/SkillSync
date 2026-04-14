const API_URL = "http://localhost:5000/api";

const parseResponse = async (res) => {
  let json = {};
  try {
    json = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || "Request failed");
  }

  return json?.data ?? json;
};

export const registerUser = async (data) => {
  try {
    const res = await fetch(`${API_URL}/register`, {
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
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return parseResponse(res);
};

export const uploadResume = async (formData) => {
  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  return parseResponse(res);
};

export const fetchHistory = async () => {
  const res = await fetch(`${API_URL}/history`);
  return parseResponse(res);
};