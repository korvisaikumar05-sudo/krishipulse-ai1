import { useState, useEffect, useCallback } from "react";
import { Leaf, Loader2, AlertCircle, BarChart3, Sparkles, Sliders, Info } from "lucide-react";
import Header from "@/components/Header";
import FarmMap from "@/components/FarmMap";
import Dashboard from "@/components/Dashboard";
import RainfallChart from "@/components/RainfallChart";
import RiskAnalysis from "@/components/RiskAnalysis";
import Simulator from "@/components/Simulator";
import Advisory from "@/components/Advisory";
import About from "@/components/About";
import type { Language, View, Crop, GrowthStage, AnalyzeResponse } from "@/types";
import { t } from "@/i18n";
import { CROPS, GROWTH_STAGES, PRESET_LOCATIONS } from "@/constants";
import { analyzeFarm, checkHealth } from "@/api";

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [lang, setLang] = useState<Language>("en");
  const [online, setOnline] = useState(false);

  const [lat, setLat] = useState(PRESET_LOCATIONS[0].lat);
  const [lon, setLon] = useState(PRESET_LOCATIONS[0].lon);
  const [crop, setCrop] = useState<Crop>("paddy");
  const [growthStage, setGrowthStage] = useState<GrowthStage>("vegetative");

  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check backend health on mount.
  useEffect(() => {
    checkHealth().then(setOnline);
    const id = setInterval(() => checkHealth().then(setOnline), 30000);
    return () => clearInterval(id);
  }, []);

  const handleSelect = (newLat: number, newLon: number) => {
    setLat(newLat);
    setLon(newLon);
  };

  const handleAnalyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeFarm(lat, lon, crop, growthStage);
      setAnalysis(data);
      setView("dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, [lat, lon, crop, growthStage]);

  const cropObj = CROPS.find((c) => c.value === crop)!;
  const stageObj = GROWTH_STAGES.find((s) => s.value === growthStage)!;

  return (
    <div className="min-h-screen bg-offwhite">
      <Header view={view} setView={setView} lang={lang} setLang={setLang} online={online} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Control panel — always visible except on About */}
        {view !== "about" && (
          <div className="card-lg p-5 mb-6">
            <div className="grid lg:grid-cols-3 gap-5">
              {/* Map */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display font-bold text-charcoal text-lg flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-emerald" />
                    {t("selectLocation", lang)}
                  </h2>
                </div>
                <FarmMap selectedLat={lat} selectedLon={lon} onSelect={handleSelect} lang={lang} />
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal/50 uppercase tracking-wide mb-2">
                    {t("selectedCoords", lang)}
                  </label>
                  <div className="p-3 rounded-xl bg-offwhite border border-mint/30 grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-charcoal/50">{t("latitude", lang)}</div>
                      <div className="text-sm font-bold text-charcoal font-mono">{lat.toFixed(4)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-charcoal/50">{t("longitude", lang)}</div>
                      <div className="text-sm font-bold text-charcoal font-mono">{lon.toFixed(4)}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal/50 uppercase tracking-wide mb-2">
                    {t("selectCrop", lang)}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {CROPS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setCrop(c.value)}
                        className={`px-2 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          crop === c.value
                            ? "bg-emerald text-white border-emerald shadow-md"
                            : "bg-white text-charcoal/70 border-mint/40 hover:border-fresh/40"
                        }`}
                      >
                        <div className="text-lg mb-0.5">{c.icon}</div>
                        <div className="text-xs">{lang === "te" ? c.labelTe : c.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal/50 uppercase tracking-wide mb-2">
                    {t("selectStage", lang)}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {GROWTH_STAGES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setGrowthStage(s.value)}
                        className={`px-2 py-2 rounded-lg text-sm font-medium transition-all border ${
                          growthStage === s.value
                            ? "bg-forest text-white border-forest shadow-md"
                            : "bg-white text-charcoal/70 border-mint/40 hover:border-fresh/40"
                        }`}
                      >
                        {lang === "te" ? s.labelTe : s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-forest to-emerald text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t("analyzing", lang)}
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5" />
                      {t("analyzeFarm", lang)}
                    </>
                  )}
                </button>

                {/* Current selection summary */}
                <div className="text-xs text-charcoal/40 text-center">
                  {cropObj.icon} {lang === "te" ? cropObj.labelTe : cropObj.label} ·{" "}
                  {lang === "te" ? stageObj.labelTe : stageObj.label}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card-lg p-4 mb-6 border-severe/30 bg-severe/5">
            <div className="flex items-center gap-2 text-severe">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* No data state */}
        {!analysis && view !== "about" && !loading && !error && (
          <div className="card-lg p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-mint/50 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-emerald" />
            </div>
            <h3 className="font-display font-bold text-charcoal text-xl mb-2">
              {lang === "te" ? "విశ్లేషణ ప్రారంభించండి" : "Start Your Analysis"}
            </h3>
            <p className="text-charcoal/60 max-w-md mx-auto">{t("noDataYet", lang)}</p>
          </div>
        )}

        {/* Views */}
        {view === "dashboard" && analysis && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <Dashboard
                lang={lang}
                crop={crop}
                growthStage={growthStage}
                lat={lat}
                lon={lon}
                data={analysis}
              />
            </div>
            <div className="space-y-5">
              <RainfallChart weather={analysis.weather} />
            </div>
          </div>
        )}

        {view === "risk" && analysis && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RiskAnalysis lang={lang} data={analysis} />
            </div>
            <div>
              <Advisory
                lang={lang}
                crop={crop}
                growthStage={growthStage}
                analysis={analysis}
              />
            </div>
          </div>
        )}

        {view === "simulator" && (
          <Simulator lang={lang} crop={crop} growthStage={growthStage} baseline={analysis} />
        )}

        {view === "about" && <About lang={lang} />}

        {/* Quick nav cards at bottom of dashboard when analysis exists */}
        {view === "dashboard" && analysis && (
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            <button
              onClick={() => setView("risk")}
              className="card p-4 text-left hover:shadow-cardlg transition-all group"
            >
              <Sparkles className="w-6 h-6 text-emerald mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-charcoal">{t("navRisk", lang)}</div>
              <div className="text-xs text-charcoal/50 mt-0.5">
                {lang === "te" ? "మోడల్ లక్షణాలు & AI సలహా" : "Model features & AI advisory"}
              </div>
            </button>
            <button
              onClick={() => setView("simulator")}
              className="card p-4 text-left hover:shadow-cardlg transition-all group"
            >
              <Sliders className="w-6 h-6 text-amber mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-charcoal">{t("navSimulator", lang)}</div>
              <div className="text-xs text-charcoal/50 mt-0.5">
                {lang === "te" ? "వాతావరణ సన్నివేశాలు" : "Test climate scenarios"}
              </div>
            </button>
            <button
              onClick={() => setView("about")}
              className="card p-4 text-left hover:shadow-cardlg transition-all group"
            >
              <Info className="w-6 h-6 text-water mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-charcoal">{t("navAbout", lang)}</div>
              <div className="text-xs text-charcoal/50 mt-0.5">
                {lang === "te" ? "డేటా మూలాలు & హెచ్చరికలు" : "Data sources & disclaimers"}
              </div>
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-mint/40 bg-white/50 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-charcoal/40">
          KrishiPulse AI · {t("tagline", lang)} · Hackathon MVP ·{" "}
          {lang === "te" ? "ప్రయోగాత్మక అంచనాలు" : "Experimental estimates"}
        </div>
      </footer>
    </div>
  );
}
