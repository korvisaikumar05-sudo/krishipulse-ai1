export type Crop = "paddy" | "cotton" | "chilli";
export type GrowthStage = "sowing" | "vegetative" | "flowering" | "harvest";
export type Language = "en" | "te";
export type View = "dashboard" | "risk" | "simulator" | "about";

export interface PresetLocation {
  id: string;
  name: string;
  nameTe: string;
  lat: number;
  lon: number;
}

export interface WeatherSummary {
  dates: string[];
  daily_precipitation: (number | null)[];
  daily_temp_max: (number | null)[];
  daily_et0: (number | null)[];
  daily_soil_moisture: (number | null)[];
  total_rainfall: number;
  avg_temp_max: number;
  peak_temp_max: number;
  total_et0: number;
  avg_soil_moisture: number;
}

export interface Predictions {
  drought_risk: number;
  flood_risk: number;
  yield_loss: number;
}

export interface RiskLevels {
  drought: string;
  flood: string;
  yield_loss: string;
}

export interface AnalyzeResponse {
  location: { latitude: number; longitude: number };
  crop: Crop;
  growth_stage: GrowthStage;
  weather: WeatherSummary;
  engineered_features: Record<string, number>;
  feature_vector: number[];
  predictions: Predictions;
  risk_levels: RiskLevels;
  inr_loss_per_acre: number;
  model_info: {
    type: string;
    n_estimators: number;
    training_data: string;
    disclaimer: string;
  };
  data_source: string;
}

export interface SimulateResponse {
  crop: Crop;
  growth_stage: GrowthStage;
  scenario: {
    extra_rainfall_mm: number;
    temp_increase_c: number;
    hypothetical: boolean;
  };
  modified_feature_vector: number[];
  predictions: Predictions;
  risk_levels: RiskLevels;
  inr_loss_per_acre: number;
  label: string;
}

export interface AdvisoryResponse {
  summary: string;
  recommendations_en: string[];
  recommendations_te: string[];
  source: "gemini" | "fallback";
}
