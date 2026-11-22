import { useState, useEffect, useCallback } from "react";
import { CloudRain, ThermometerSun, RotateCcw, Zap, AlertCircle } from "lucide-react";
import type { Language, Crop, GrowthStage } from "@/types";
import type { AnalyzeResponse, SimulateResponse } from "@/types";
import { t } from "@/i18n";
import { RISK_COLORS } from "@/constants";
import { simulateScenario } from "@/api";

interface SimulatorProps {
  lang: Language;
  crop: Crop;
  growthStage: GrowthStage;
  baseline: AnalyzeResponse | null;
}

interface SimResult {
  extraRain: number;
  tempInc: number;
  data: SimulateResponse;
}

function SimMetric({
  label,
  value,
  baseline,
  color,
  unit,
}: {
  label: string;
  value: number;
  baseline: number;
  color: string;
  unit: string;
}) {
  const delta = value - baseline;
  const deltaStr = delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);
  const deltaColor = delta > 0.5 ? "text-severe" : delta < -0.5 ? "text-emerald" : "text-charcoal/40";
  return (
    <div className="metric-card">
      <div className="text-xs font-medium text-charcoal/50 uppercase tracking-wide">{label}</div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-display font-bold" style={{ color }}>
          {value.toFixed(1)}{unit}
        </span>
        <span className={`text-sm font-semibold ${deltaColor}`}>{deltaStr}{unit}</span>
      </div>
    </div>
  );
}

export default function Simulator({ lang, crop, growthStage, baseline }: SimulatorProps) {
  const [extraRain, setExtraRain] = useState(0);
  const [tempInc, setTempInc] = useState(0);
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSim = useCallback(
    async (rain: number, temp: number) => {
      if (!baseline) return;
      setLoading(true);
      setError(null);
      try {
        const data = await simulateScenario(baseline.feature_vector, crop, growthStage, rain, temp);
        setResult({ extraRain: rain, tempInc: temp, data });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Simulation failed");
      } finally {
        setLoading(false);
      }
    },
    [baseline, crop, growthStage],
  );

  // Auto-run on slider change (debounced via timeout).
  useEffect(() => {
    if (!baseline) return;
    const id = setTimeout(() => runSim(extraRain, tempInc), 250);
    return () => clearTimeout(id);
  }, [extraRain, tempInc, baseline, runSim]);

  if (!baseline) {
    return (
      <div className="card-lg p-8 text-center animate-fade-in">
        <AlertCircle className="w-10 h-10 text-charcoal/30 mx-auto mb-3" />
        <p className="text-charcoal/60">{t("noDataYet", lang)}</p>
      </div>
    );
  }

  const preds = result?.data.predictions ?? baseline.predictions;
  const inr = result?.data.inr_loss_per_acre ?? baseline.inr_loss_per_acre;
  const riskLevels = result?.data.risk_levels ?? baseline.risk_levels;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="card-lg p-5">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-amber" />
          <h3 className="font-display font-bold text-charcoal text-lg">{t("simulator", lang)}</h3>
        </div>
        <p className="text-sm text-charcoal/50 mb-5">
          {lang === "te"
            ? "స్లయిడర్లను కదిల్చండి. ఫలితాలు వెంటనే లెక్కించబడతాయి — తాజా వాతావరణం మళ్లీ అభ్యర్థించబడదు."
            : "Drag the sliders. Results recalculate instantly — no fresh weather request is made."}
        </p>

        {/* Rainfall slider */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-medium text-charcoal">
              <CloudRain className="w-4 h-4 text-water" />
              {t("extraRainfall", lang)}
            </label>
            <span className="text-sm font-bold text-water">{extraRain} mm</span>
          </div>
          <input
            type="range"
            min={0}
            max={150}
            step={5}
            value={extraRain}
            onChange={(e) => setExtraRain(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-charcoal/40 mt-1">
            <span>0 mm</span>
            <span>150 mm</span>
          </div>
        </div>

        {/* Temperature slider */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-medium text-charcoal">
              <ThermometerSun className="w-4 h-4 text-amber" />
              {t("tempIncrease", lang)}
            </label>
            <span className="text-sm font-bold text-amber">+{tempInc}°C</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={tempInc}
            onChange={(e) => setTempInc(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-charcoal/40 mt-1">
            <span>0°C</span>
            <span>+10°C</span>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            setExtraRain(0);
            setTempInc(0);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-mint/50 hover:bg-mint text-forest text-sm font-medium transition-colors border border-mint"
        >
          <RotateCcw className="w-4 h-4" />
          {t("resetSim", lang)}
        </button>
      </div>

      {error && (
        <div className="card-lg p-4 border-severe/30 bg-severe/5">
          <div className="flex items-center gap-2 text-severe">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="card-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-charcoal">
            {lang === "te" ? "సిమ్యులేటెడ్ ఫలితాలు" : "Simulated Results"}
          </h4>
          {loading && (
            <span className="text-xs text-charcoal/40 animate-pulse">{t("analyzing", lang)}</span>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SimMetric
            label={t("droughtRisk", lang)}
            value={preds.drought_risk}
            baseline={baseline.predictions.drought_risk}
            color={RISK_COLORS[riskLevels.drought]}
            unit="%"
          />
          <SimMetric
            label={t("floodRisk", lang)}
            value={preds.flood_risk}
            baseline={baseline.predictions.flood_risk}
            color={RISK_COLORS[riskLevels.flood]}
            unit="%"
          />
          <SimMetric
            label={t("yieldLoss", lang)}
            value={preds.yield_loss}
            baseline={baseline.predictions.yield_loss}
            color={RISK_COLORS[riskLevels.yield_loss]}
            unit="%"
          />
          <div className="metric-card">
            <div className="text-xs font-medium text-charcoal/50 uppercase tracking-wide">{t("inrLoss", lang)}</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-display font-bold text-severe">
                ₹{inr.toLocaleString("en-IN")}
              </span>
              <span
                className={`text-sm font-semibold ${
                  inr - baseline.inr_loss_per_acre > 0 ? "text-severe" : "text-emerald"
                }`}
              >
                {inr - baseline.inr_loss_per_acre >= 0 ? "+" : ""}
                ₹{(inr - baseline.inr_loss_per_acre).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-amber/10 border border-amber/30">
          <AlertCircle className="w-4 h-4 text-amber-dark flex-shrink-0 mt-0.5" />
          <p className="text-xs text-charcoal/70">{t("hypotheticalLabel", lang)}</p>
        </div>
      </div>
    </div>
  );
}
