import { Leaf, Activity, Languages } from "lucide-react";
import type { Language, View } from "@/types";
import { t } from "@/i18n";

interface HeaderProps {
  view: View;
  setView: (v: View) => void;
  lang: Language;
  setLang: (l: Language) => void;
  online: boolean;
}

const NAV_ITEMS: { id: View; key: string }[] = [
  { id: "dashboard", key: "navDashboard" },
  { id: "risk", key: "navRisk" },
  { id: "simulator", key: "navSimulator" },
  { id: "about", key: "navAbout" },
];

export default function Header({ view, setView, lang, setLang, online }: HeaderProps) {
  return (
    <header className="sticky top-0 z-[1000] bg-white/90 backdrop-blur-md border-b border-mint/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => setView("dashboard")}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-forest to-emerald flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-mint" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <div className="font-display font-extrabold text-charcoal text-lg leading-none">
                KrishiPulse <span className="text-emerald">AI</span>
              </div>
              <div className="text-[10px] text-charcoal/50 leading-none mt-0.5 hidden sm:block">
                {t("tagline", lang)}
              </div>
            </div>
          </button>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  view === item.id
                    ? "bg-emerald/10 text-emerald"
                    : "text-charcoal/60 hover:text-emerald hover:bg-mint/40"
                }`}
              >
                {t(item.key, lang)}
              </button>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Live status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-mint/50">
              <Activity
                className={`w-3.5 h-3.5 ${online ? "text-emerald animate-pulse-soft" : "text-severe"}`}
              />
              <span className={`text-xs font-medium ${online ? "text-emerald" : "text-severe"}`}>
                {online ? t("connected", lang) : t("offline", lang)}
              </span>
            </div>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "te" : "en")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-mint bg-white hover:bg-mint/40 transition-colors"
            >
              <Languages className="w-4 h-4 text-emerald" />
              <span className="text-sm font-semibold text-charcoal">
                {lang === "en" ? "EN" : "తె"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center gap-1 pb-2 -mt-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                view === item.id
                  ? "bg-emerald/10 text-emerald"
                  : "text-charcoal/60 hover:text-emerald"
              }`}
            >
              {t(item.key, lang)}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
