import type {
  AnalyzeResponse,
  AdvisoryResponse,
  Crop,
  GrowthStage,
  SimulateResponse,
} from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function analyzeFarm(
  lat: number,
  lon: number,
  crop: Crop,
  growthStage: GrowthStage,
): Promise<AnalyzeResponse> {
  return postJson<AnalyzeResponse>("/api/analyze", {
    latitude: lat,
    longitude: lon,
    crop,
    growthStage,
  });
}

export async function simulateScenario(
  featureVector: number[],
  crop: Crop,
  growthStage: GrowthStage,
  extraRainfallMm: number,
  tempIncreaseC: number,
): Promise<SimulateResponse> {
  return postJson<SimulateResponse>("/api/simulate", {
    featureVector,
    crop,
    growthStage,
    extraRainfallMm,
    tempIncreaseC,
  });
}

export async function getAdvisory(
  crop: Crop,
  growthStage: GrowthStage,
  droughtRisk: number,
  floodRisk: number,
  yieldLoss: number,
): Promise<AdvisoryResponse> {
  return postJson<AdvisoryResponse>("/api/advisory", {
    crop,
    growthStage,
    droughtRisk,
    floodRisk,
    yieldLoss,
  });
}
