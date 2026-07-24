import client from "./client";

export async function getRecommendedTask() {
  const response = await client.get("/tasks/recommended");
  return response.data;
}

export async function completeTask(taskId: string, analysisId: string) {
  const response = await client.post("/tasks/complete", {
    task_id: taskId,
    analysis_id: analysisId
  });
  return response.data;
}

export async function getUserProgress() {
  const response = await client.get("/progress");
  return response.data;
}
