import { Brain, Database, Cpu, Info, AlertTriangle } from "lucide-react";
import type { Language } from "@/types";
import type { AnalyzeResponse } from "@/types";
import { t } from "@/i18n";

interface RiskAnalysisProps {
  lang: Language;
  data: AnalyzeResponse;
}

const FEATURE_LABELS: Record<string, { en: string; te: string; desc: { en: string; te: string } }> = {
  total_rainfall: {
    en: "Total Rainfall",
    te: "మొత్తం వర్షపాతం",
    desc: { en: "7-day accumulated precipitation (mm)", te: "7-రోజుల మొత్తం వర్షపాతం (mm)" },
  },
  rainfall_deviation: {
    en: "Rainfall Deviation",
    te: "వర్షపాతం పరివర్తన",
    desc: { en: "Surplus or deficit vs reference (35 mm)", te: "సూచన vs అధిక/లోటు (35 mm)" },
  },
  heat_stress: {
    en: "Heat Stress",
    te: "వేడి ఒత్తిడి",
    desc: { en: "Avg max temp above 35°C baseline", te: "35°C ప్రాథమిక పైన గరిష్ట ఉష్ణోగ్రత" },
  },
  et_demand: {
    en: "ET Demand",
    te: "ET డిమాండ్",
    desc: { en: "Evapotranspiration water demand", te: "ఆవిరిచెట్ల నీటి డిమాండ్" },
  },
  soil_moisture_stress: {
    en: "Soil Moisture Stress",
    te: "నేల తేమ ఒత్తిడి",
    desc: { en: "Deficit vs optimal 0.25 m³/m³", te: "సరైన 0.25 vs లోటు" },
  },
  crop_sensitivity: {
    en: "Crop Sensitivity",
    te: "పంట సున్నితత",
    desc: { en: "Crop-specific drought tolerance factor", te: "పంట-నిర్దిష్ట కరువు సహనశీలి" },
  },
  stage_sensitivity: {
    en: "Stage Sensitivity",
    te: "దశ సున్నితత",
    desc: { en: "Growth-stage vulnerability factor", te: "దశ-నిర్దిష్ట దుర్బలత కారకం" },
  },
};

export default function RiskAnalysis({ lang, data }: RiskAnalysisProps) {
  const features = data.engineered_features;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Engineered features */}
      <div className="card-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-emerald" />
          <h3 className="font-display font-bold text-charcoal text-lg">
            {t("engineeredFeatures", lang)}
          </h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.entries(features).map(([key, val]) => {
            const meta = FEATURE_LABELS[key];
            if (!meta) return null;
            return (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-offwhite border border-mint/30">
                <div className="min-w-0 mr-3">
                  <div className="text-sm font-semibold text-charcoal">{meta[lang]}</div>
                  <div className="text-xs text-charcoal/50">{meta.desc[lang]}</div>
                </div>
                <div className="text-lg font-display font-bold text-emerald flex-shrink-0">
                  {val.toFixed(3)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model transparency */}
      <div className="card-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-5 h-5 text-emerald" />
          <h3 className="font-display font-bold text-charcoal text-lg">
            {t("modelTransparency", lang)}
          </h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-offwhite border border-mint/30">
            <div className="text-xs text-charcoal/50 uppercase tracking-wide">{lang === "te" ? "మోడల్" : "Model"}</div>
            <div className="text-sm font-semibold text-charcoal mt-1">{data.model_info.type}</div>
          </div>
          <div className="p-3 rounded-xl bg-offwhite border border-mint/30">
            <div className="text-xs text-charcoal/50 uppercase tracking-wide">{lang === "te" ? "చెట్లు" : "Trees"}</div>
            <div className="text-sm font-semibold text-charcoal mt-1">{data.model_info.n_estimators}</div>
          </div>
          <div className="p-3 rounded-xl bg-offwhite border border-mint/30">
            <div className="text-xs text-charcoal/50 uppercase tracking-wide">{lang === "te" ? "మూలం" : "Source"}</div>
            <div className="text-sm font-semibold text-charcoal mt-1">{data.data_source}</div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber/10 border border-amber/30">
          <AlertTriangle className="w-5 h-5 text-amber-dark flex-shrink-0 mt-0.5" />
          <p className="text-sm text-charcoal/80">{data.model_info.disclaimer}</p>
        </div>
      </div>

      {/* Feature vector */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-emerald" />
          <h4 className="font-semibold text-charcoal text-sm">
            {lang === "te" ? "ఫీచర్ వెక్టర్ (సిమ్యులేటర్ ఉపయోగిస్తుంది)" : "Feature Vector (used by simulator)"}
          </h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.feature_vector.map((v, i) => (
            <span key={i} className="px-2.5 py-1 rounded-lg bg-mint/40 text-forest text-xs font-mono font-medium">
              {v.toFixed(3)}
            </span>
          ))}
        </div>
        <div className="flex items-start gap-2 mt-3">
          <Info className="w-3.5 h-3.5 text-charcoal/40 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-charcoal/50">
            {lang === "te"
              ? "ఈ 7-విలువ వెక్టర్ సిమ్యులేటర్‌కు పంపబడుతుంది. స్లయిడర్లు కదిలినప్పుడు తాజా వాతావరణం మళ్లీ అభ్యర్థించబడదు."
              : "This 7-value vector is sent to the simulator. Moving sliders does NOT re-fetch fresh weather data."}
          </p>
        </div>
      </div>
    </div>
  );
}
