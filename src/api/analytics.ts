import client from "./client";

export async function getDashboardSummary() {
  const response = await client.get("/dashboard/summary");
  return response.data;
}

export async function getFullDashboardAnalytics() {
  const response = await client.get("/analytics/dashboard");
  return response.data;
}

export async function getPhoneticDeviations() {
  const response = await client.get("/analytics/phonetic-deviations");
  return response.data;
}

export async function getUserProgress() {
  const response = await client.get("/user/progress");
  return response.data;
}

export async function getUserHistory() {
  const response = await client.get("/user/history");
  return response.data;
}

export async function getGlobalAnalytics() {
  const response = await client.get("/analytics/global");
  return response.data;
}

export async function getComparisonAnalytics() {
  const response = await client.get("/analytics/comparison");
  return response.data;
}

export async function rebuildAnalytics() {
  const response = await client.post("/analytics/rebuild");
  return response.data;
}

export async function rebuildDataset() {
  const response = await client.post("/rebuild-dataset");
  return response.data;
}