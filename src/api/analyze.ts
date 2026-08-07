import client from "./client";

export interface WordAnalysis {
  word: string;
  start: number;
  end: number;
  duration: number;
  confidence: number;
  score: number;
  status: 'correct' | 'warning' | 'error';
}

export interface PhonemeAnalysis {
  symbol: string;
  start: number;
  end: number;
  duration: number;
  confidence: number;
  score: number;
  error_type?: string;
  expected?: string;
  detected?: string;
  feedback?: string;
}

export interface AnalysisRecommendation {
  type: string;
  message: string;
}

export interface AnalysisResponse {
  id: string;
  overall_score: number;
  dimensions: {
    intonation: number;
    pronunciation: number;
    fluency: number;
    clarity: number;
    accent: number;
  };
  similarity: {
    male: number;
    female: number;
  };
  voice_profile: string;
  pronunciation: {
    transcription: string;
    words: WordAnalysis[];
    phonemes: PhonemeAnalysis[];
    pronunciation_score: number;
    word_score: number;
    phoneme_score: number;
    errors: any[];
  };
  pitch: {
    mean: number;
    range: number;
    contour: number[];
  };
  energy: {
    mean: number;
    contour: number[];
  };
  pause: {
    ratio: number;
    timeline: { start: number; end: number; duration: number }[];
  };
  phonetics: {
    vowel_space: { vowel: string; f1: number; f2: number; distance_male: number; distance_female: number; accuracy: number }[];
    formants?: { F1: number; F2: number; F3: number };
    vowels: { vowel: string; accuracy: number }[];
  };
  articulation: {
    zcr: number;
    spectral_centroid: number;
    spectral_bandwidth: number;
    spectral_contrast: number;
    speech_clarity: number;
  };
  accent: {
    speaking_rate_wpm: number;
    rhythm_variance: number;
    stress_density: number;
    pitch_variance: number;
    pause_ratio: number;
    accent_classification: string;
  };
  intonation: {
    sentence_ending: string;
    pattern: string;
    pitch_variance: number;
    similarity_score: number;
    user_contour: number[];
    male_contour: number[];
    female_contour: number[];
    male_similarity: number;
    female_similarity: number;
    preferred_reference: string;
  };
  recommendation: AnalysisRecommendation[];
}

export async function analyzeAudioStream(
  file: File,
  targetText: string,
  onProgress: (step: string, percent: number) => void
): Promise<AnalysisResponse> {
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