import { useState } from "react";
import { Lightbulb, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import type { Language, Crop, GrowthStage } from "@/types";
import type { AnalyzeResponse, AdvisoryResponse } from "@/types";
import { t } from "@/i18n";
import { getAdvisory } from "@/api";

interface AdvisoryProps {
  lang: Language;
  crop: Crop;
  growthStage: GrowthStage;
  analysis: AnalyzeResponse | null;
}

export default function Advisory({ lang, crop, growthStage, analysis }: AdvisoryProps) {
  const [advisory, setAdvisory] = useState<AdvisoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvisory = async () => {
    if (!analysis) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAdvisory(
        crop,
        growthStage,
        analysis.predictions.drought_risk,
        analysis.predictions.flood_risk,
        analysis.predictions.yield_loss,
      );
      setAdvisory(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Advisory failed");
    } finally {
      setLoading(false);
    }
  };

  if (!analysis) {
    return (
      <div className="card-lg p-8 text-center animate-fade-in">
        <AlertCircle className="w-10 h-10 text-charcoal/30 mx-auto mb-3" />
        <p className="text-charcoal/60">{t("noDataYet", lang)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="card-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber" />
            <h3 className="font-display font-bold text-charcoal text-lg">{t("advisory", lang)}</h3>
          </div>
          <button
            onClick={fetchAdvisory}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald text-white text-sm font-medium hover:bg-forest transition-colors disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? t("loadingAdvisory", lang) : t("getAdvisory", lang)}
          </button>
        </div>

        {!advisory && !loading && !error && (
          <p className="text-sm text-charcoal/50 text-center py-6">
            {lang === "te"
              ? "AI సలహా పొందడానికి పై బటన్ క్లిక్ చేయండి."
              : "Click the button above to generate AI-powered recommendations."}
          </p>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-severe/5 border border-severe/30 text-severe">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {advisory && (
          <div className="space-y-4 animate-slide-up">
            {/* Summary */}
            <div className="p-4 rounded-xl bg-mint/30 border border-mint/50">
              <div className="text-xs font-medium text-emerald uppercase tracking-wide mb-1">
                {t("summary", lang)}
              </div>
              <p className="text-sm text-charcoal">{advisory.summary}</p>
            </div>

            {/* Source badge */}
            <div className="flex items-center gap-1.5">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  advisory.source === "gemini"
                    ? "bg-emerald/10 text-emerald"
                    : "bg-charcoal/10 text-charcoal/60"
                }`}
              >
                {advisory.source === "gemini" ? t("sourceGemini", lang) : t("sourceFallback", lang)}
              </span>
            </div>

            {/* Recommendations */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-offwhite border border-mint/30">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-6 h-6 rounded-md bg-emerald text-white text-xs font-bold flex items-center justify-center">
                    EN
                  </span>
                  <h4 className="font-semibold text-charcoal text-sm">{t("recommendations", lang)}</h4>
                </div>
                <ol className="space-y-2.5">
                  {advisory.recommendations_en.map((rec, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-charcoal/80">
                      <span className="w-5 h-5 rounded-full bg-mint text-forest text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-offwhite border border-mint/30">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-6 h-6 rounded-md bg-forest text-mint text-xs font-bold flex items-center justify-center">
                    తె
                  </span>
                  <h4 className="font-semibold text-charcoal text-sm">
                    {t("recommendations", lang)} (తెలుగు)
                  </h4>
                </div>
                <ol className="space-y-2.5">
                  {advisory.recommendations_te.map((rec, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-charcoal/80" lang="te">
                      <span className="w-5 h-5 rounded-full bg-mint text-forest text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
