import client from "./client";

export async function analyzeAudioStream(
  file: File,
  targetText: string,
  onProgress: (step: string, percent: number) => void
): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("target_text", targetText);

  // Use native fetch to read stream
  const token = localStorage.getItem("token");
  const baseUrl = client.defaults.baseURL || "http://localhost:8000";
  
  const response = await fetch(`${baseUrl}/analyze`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    const errorBody = await response.json();
    throw new Error(errorBody.detail || "Analysis failed");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");
  
  if (!reader) {
    throw new Error("Streaming not supported by browser");
  }

  let result = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    // Split by newlines as SSE sends data chunks ending with \n\n
    const lines = chunk.split("\n");
    
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.substring(6).trim();
        if (!jsonStr) continue;
        
        try {
          const data = JSON.parse(jsonStr);
          if (data.status === "progress") {
            onProgress(data.step, data.progress);
          } else if (data.status === "complete") {
            result = data.result;
          }
        } catch (e) {
          console.error("Failed to parse SSE JSON chunk:", jsonStr, e);
        }
      }
    }
  }

  return result;
}

export async function getLatestAnalysis() {
  const response = await client.get("/analysis/latest");
  return response.data;
}

export async function getAnalysisById(id: string) {
  const response = await client.get(`/analysis/${id}`);
  return response.data;
}