import client from "./client";

interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload) {
  const response = await client.post("/auth/login", payload);
  return response.data;
}

export async function register(payload: LoginPayload) {
  const response = await client.post("/auth/register", payload);
  return response.data;
}