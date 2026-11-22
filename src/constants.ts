import type { Crop, GrowthStage, PresetLocation } from "@/types";

export const PRESET_LOCATIONS: PresetLocation[] = [
  { id: "ranga-reddy", name: "Ranga Reddy", nameTe: "రంగారెడ్డి", lat: 17.4239, lon: 78.4029 },
  { id: "nalgonda", name: "Nalgonda", nameTe: "నల్గొండ", lat: 17.0566, lon: 79.2683 },
  { id: "warangal", name: "Warangal", nameTe: "వరంగల్", lat: 17.9689, lon: 79.5941 },
];

export const TELANGANA_CENTER: [number, number] = [17.385, 78.4867];
export const INITIAL_ZOOM = 7;

export const CROPS: { value: Crop; label: string; labelTe: string; icon: string }[] = [
  { value: "paddy", label: "Paddy", labelTe: "వరి", icon: "🌾" },
  { value: "cotton", label: "Cotton", labelTe: "ప్రత్తి", icon: "🌱" },
  { value: "chilli", label: "Chilli", labelTe: "మిరప", icon: "🌶️" },
];

export const GROWTH_STAGES: { value: GrowthStage; label: string; labelTe: string }[] = [
  { value: "sowing", label: "Sowing", labelTe: "విత్తనం" },
  { value: "vegetative", label: "Vegetative", labelTe: "పెరుగుదల" },
  { value: "flowering", label: "Flowering", labelTe: "పుష్పించే" },
  { value: "harvest", label: "Harvest", labelTe: "పంట కోత" },
];

export const RISK_COLORS: Record<string, string> = {
  severe: "#DC2626",
  moderate: "#F59E0B",
  low: "#16A34A",
  minimal: "#047857",
};
