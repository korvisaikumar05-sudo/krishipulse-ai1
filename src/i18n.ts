import type { Language } from "@/types";

type Dict = Record<string, { en: string; te: string }>;

const STRINGS: Dict = {
  appName: { en: "KrishiPulse AI", te: "కృషిపల్స్ AI" },
  tagline: {
    en: "Hyperlocal Climate & Yield Intelligence",
    te: "హైపర్‌లోకల్ వాతావరణ & దిగుబడి ఇంటెలిజెన్స్",
  },
  navDashboard: { en: "Dashboard", te: "డాష్‌బోర్డ్" },
  navRisk: { en: "Risk Analysis", te: "రిస్క్ విశ్లేషణ" },
  navSimulator: { en: "Simulator", te: "సిమ్యులేటర్" },
  navAbout: { en: "About", te: "గురించి" },

  liveData: { en: "Live Data", te: "ప్రత్యక్ష డేటా" },
  connected: { en: "Connected", te: "అనుసంధానం" },
  offline: { en: "Offline", te: "ఆఫ్‌లైన్" },

  selectLocation: { en: "Select Farm Location", te: "పొలం స్థానం ఎంచుకోండి" },
  selectCrop: { en: "Crop", te: "పంట" },
  selectStage: { en: "Growth Stage", te: "పెరుగుదల దశ" },
  analyzeFarm: { en: "Analyze Farm", te: "పొలం విశ్లేషించండి" },
  analyzing: { en: "Analyzing…", te: "విశ్లేషిస్తోంది…" },

  presetLocations: { en: "Preset Locations", te: "ప్రీసెట్ స్థానాలు" },
  clickToSelect: { en: "Click map to select exact farm", te: "ఖచ్చిత పొలం కోసం మ్యాప్‌పై క్లిక్ చేయండి" },
  selectedCoords: { en: "Selected Coordinates", te: "ఎంచుకున్న కోఆర్డినేట్లు" },
  latitude: { en: "Latitude", te: "అక్షాంశం" },
  longitude: { en: "Longitude", te: "రేఖాంశం" },

  currentWeather: { en: "Current Weather Summary", te: "ప్రస్తుత వాతావరణ సారాంశం" },
  sevenDayRainfall: { en: "7-Day Rainfall", te: "7-రోజుల వర్షపాతం" },
  maxTemp: { en: "Max Temperature", te: "గరిష్ట ఉష్ణోగ్రత" },
  evapotranspiration: { en: "Evapotranspiration", te: "ఆవిరిచెట్లు" },
  soilMoisture: { en: "Surface Soil Moisture", te: "ఉపరితల నేల తేమ" },

  droughtRisk: { en: "Drought Risk", te: "కరువు ప్రమాదం" },
  floodRisk: { en: "Flood / Waterlogging Risk", te: "వరద / నీటి నిలుపు ప్రమాదం" },
  yieldLoss: { en: "Estimated Yield Loss", te: "అంచనా దిగుబడి నష్టం" },
  inrLoss: { en: "Indicative INR Loss / Acre", te: "సూచన రూ. నష్టం / ఎకరం" },

  riskAnalysis: { en: "Risk Analysis", te: "రిస్క్ విశ్లేషణ" },
  engineeredFeatures: { en: "Engineered Climate Features", te: "ఇంజనీరింగ్ వాతావరణ లక్షణాలు" },
  modelTransparency: { en: "Model Transparency", te: "మోడల్ పారదర్శకత" },
  getAdvisory: { en: "Get AI Advisory", te: "AI సలహా పొందండి" },
  loadingAdvisory: { en: "Generating advisory…", te: "సలహా రూపొందిస్తోంది…" },

  simulator: { en: "What-If Climate Simulator", te: "వాట్-ఇఫ్ వాతావరణ సిమ్యులేటర్" },
  extraRainfall: { en: "Additional Rainfall", te: "అదనపు వర్షపాతం" },
  tempIncrease: { en: "Temperature Increase", te: "ఉష్ణోగ్రత పెరుగుదల" },
  simulateNow: { en: "Run Simulation", te: "సిమ్యులేషన్ నడపండి" },
  hypotheticalLabel: {
    en: "Hypothetical scenario — not a forecast",
    te: "ఊహాత్మక సన్నివేశం — అంచనా కాదు",
  },
  resetSim: { en: "Reset to Baseline", te: "ప్రాథమిక స్థితికి రీసెట్" },
  vsBaseline: { en: "vs Baseline", te: "ప్రాథమిక vs" },

  advisory: { en: "Agricultural Advisory", te: "వ్యవసాయ సలహా" },
  recommendations: { en: "Recommendations", te: "సిఫార్సులు" },
  summary: { en: "Risk Summary", te: "ప్రమాద సారాంశం" },
  sourceGemini: { en: "Powered by Google Gemini", te: "గూగుల్ జెమిని ద్వారా" },
  sourceFallback: { en: "Built-in fallback advisory", te: "అంతర్గత ఫాల్‌బ్యాక్ సలహా" },

  about: { en: "About & Data Sources", te: "గురించి & డేటా మూలాలు" },
  aboutDesc: {
    en: "KrishiPulse AI is a hackathon MVP that combines real-time weather data with machine learning to help Telangana farmers understand climate risks.",
    te: "కృషిపల్స్ AI అనేది నిజ-సమయ వాతావరణ డేటాను మెషిన్ లెర్నింగ్‌తో కలిపి తెలంగాణ రైతులకు వాతావరణ ప్రమాదాలను అర్థం చేసుకోవడంలో సహాయపడే హ్యాకథాన్ MVP.",
  },
  dataSources: { en: "Data Sources & Technologies", te: "డేటా మూలాలు & సాంకేతికతలు" },
  disclaimers: { en: "Transparency & Disclaimers", te: "పారదర్శకత & హెచ్చరికలు" },

  noDataYet: {
    en: "Select a location, crop, and growth stage, then click Analyze Farm to begin.",
    te: "స్థానం, పంట, దశ ఎంచుకుని పొలం విశ్లేషించండి క్లిక్ చేయండి.",
  },
  errorOccurred: { en: "Something went wrong", te: "ఏదో తప్పు జరిగింది" },
  retry: { en: "Retry", te: "మళ్లీ ప్రయత్నించండి" },
};

export function t(key: string, lang: Language): string {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[lang];
}

export function tcrop(crop: string, lang: Language): string {
  if (lang === "te") {
    const map: Record<string, string> = { paddy: "వరి", cotton: "ప్రత్తి", chilli: "మిరప" };
    return map[crop] || crop;
  }
  return crop.charAt(0).toUpperCase() + crop.slice(1);
}

export function tstage(stage: string, lang: Language): string {
  if (lang === "te") {
    const map: Record<string, string> = {
      sowing: "విత్తనం",
      vegetative: "పెరుగుదల",
      flowering: "పుష్పించే",
      harvest: "పంట కోత",
    };
    return map[stage] || stage;
  }
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}
