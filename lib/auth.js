import axios from "axios";

const API = "https://cab-booking-backend-rcg3.onrender.com/api/auth";

export async function registerUser(data) {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message);

  return result;
}

export async function loginUser(data) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message);

  localStorage.setItem("token", result.token);
  localStorage.setItem("role", result.user.role);

  return result;
}