import {
  CloudRain,
  ThermometerSun,
  Droplets,
  Waves,
  MapPin,
  Sprout,
  TrendingUp,
} from "lucide-react";
import type { Language, Crop, GrowthStage } from "@/types";
import type { AnalyzeResponse } from "@/types";
import { t, tcrop, tstage } from "@/i18n";
import { RISK_COLORS } from "@/constants";

interface DashboardProps {
  lang: Language;
  crop: Crop;
  growthStage: GrowthStage;
  lat: number;
  lon: number;
  data: AnalyzeResponse | null;
}

interface MetricCardProps {
  icon: typeof CloudRain;
  label: string;
  value: string;
  sublabel?: string;
  color: string;
}

function MetricCard({ icon: Icon, label, value, sublabel, color }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-xs font-medium text-charcoal/50 uppercase tracking-wide">{label}</div>
          <div className="text-2xl font-display font-bold text-charcoal mt-1">{value}</div>
          {sublabel && <div className="text-xs text-charcoal/40 mt-0.5">{sublabel}</div>}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}1a` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function RiskBar({ label, value, color, lang }: { label: string; value: number; color: string; lang: Language }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-sm text-charcoal/70 flex-shrink-0">{label}</div>
      <div className="flex-1 h-3 rounded-full bg-mint/40 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-sm font-bold w-12 text-right" style={{ color }}>
        {value.toFixed(0)}%
      </div>
    </div>
  );
}

export default function Dashboard({ lang, crop, growthStage, lat, lon, data }: DashboardProps) {
  if (!data) return null;
  const wx = data.weather;
  const preds = data.predictions;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Location + crop strip */}
      <div className="card-lg p-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald" />
            <div>
              <div className="text-xs text-charcoal/50 uppercase tracking-wide">{t("selectLocation", lang)}</div>
              <div className="font-semibold text-charcoal text-sm">
                {lat.toFixed(4)}°N, {lon.toFixed(4)}°E
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-fresh" />
            <div>
              <div className="text-xs text-charcoal/50 uppercase tracking-wide">{t("selectCrop", lang)}</div>
              <div className="font-semibold text-charcoal text-sm">{tcrop(crop, lang)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber" />
            <div>
              <div className="text-xs text-charcoal/50 uppercase tracking-wide">{t("selectStage", lang)}</div>
              <div className="font-semibold text-charcoal text-sm">{tstage(growthStage, lang)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={CloudRain}
          label={t("sevenDayRainfall", lang)}
          value={`${wx.total_rainfall.toFixed(1)} mm`}
          sublabel={`${lang === "te" ? "7 రోజుల" : "7-day"} total`}
          color="#2563EB"
        />
        <MetricCard
          icon={ThermometerSun}
          label={t("maxTemp", lang)}
          value={`${wx.avg_temp_max.toFixed(1)}°C`}
          sublabel={`Peak ${wx.peak_temp_max.toFixed(1)}°C`}
          color="#F59E0B"
        />
        <MetricCard
          icon={Droplets}
          label={t("evapotranspiration", lang)}
          value={`${wx.total_et0.toFixed(1)} mm`}
          sublabel={lang === "te" ? "7 రోజుల మొత్తం" : "7-day total"}
          color="#047857"
        />
        <MetricCard
          icon={Waves}
          label={t("soilMoisture", lang)}
          value={`${(wx.avg_soil_moisture * 100).toFixed(1)}%`}
          sublabel={lang === "te" ? "0–1cm ఉపరితలం" : "0–1cm surface"}
          color="#2563EB"
        />
      </div>

      {/* Risk summary */}
      <div className="card-lg p-5">
        <h3 className="font-display font-bold text-charcoal text-lg mb-4">{t("riskAnalysis", lang)}</h3>
        <div className="space-y-3.5">
          <RiskBar
            label={t("droughtRisk", lang)}
            value={preds.drought_risk}
            color={RISK_COLORS[data.risk_levels.drought]}
            lang={lang}
          />
          <RiskBar
            label={t("floodRisk", lang)}
            value={preds.flood_risk}
            color={RISK_COLORS[data.risk_levels.flood]}
            lang={lang}
          />
          <RiskBar
            label={t("yieldLoss", lang)}
            value={preds.yield_loss}
            color={RISK_COLORS[data.risk_levels.yield_loss]}
            lang={lang}
          />
        </div>
        <div className="mt-4 pt-4 border-t border-mint/40 flex items-center justify-between">
          <span className="text-sm text-charcoal/60">{t("inrLoss", lang)}</span>
          <span className="font-display font-bold text-2xl text-severe">
            ₹{data.inr_loss_per_acre.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
}
