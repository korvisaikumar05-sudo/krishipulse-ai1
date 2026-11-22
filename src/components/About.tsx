import {
  Cloud,
  Brain,
  Map as MapIcon,
  Sparkles,
  AlertTriangle,
  Info,
  Github,
  Server,
  Rocket,
} from "lucide-react";
import type { Language } from "@/types";
import { t } from "@/i18n";

interface AboutProps {
  lang: Language;
}

const SOURCES = [
  {
    icon: Cloud,
    name: "Open-Meteo",
    nameTe: "ఓపెన్-మీటియో",
    desc: "Weather forecast & soil moisture data",
    descTe: "వాతావరణ అంచనా & నేల తేమ డేటా",
  },
  {
    icon: Brain,
    name: "scikit-learn",
    nameTe: "సైకిట్-లెర్న్",
    desc: "Random Forest regression model",
    descTe: "రాండమ్ ఫారెస్ట్ రిగ్రెషన్ మోడల్",
  },
  {
    icon: Sparkles,
    name: "Google Gemini API",
    nameTe: "గూగుల్ జెమిని API",
    desc: "AI agricultural advisory generation",
    descTe: "AI వ్యవసాయ సలహా రూపొందిదల",
  },
  {
    icon: MapIcon,
    name: "React-Leaflet & OpenStreetMap",
    nameTe: "రియాక్ట్-లీఫ్‌లెట్ & ఓపెన్‌స్ట్రీట్‌మ్యాప్",
    desc: "Interactive farm location mapping",
    descTe: "ఇంటరాక్టివ్ పొలం స్థాన మ్యాపింగ్",
  },
];

const DISCLAIMERS = [
  {
    en: "The Random Forest model is trained on SYNTHETIC agronomic scenarios, not validated real-world field trial data.",
    te: "రాండమ్ ఫారెస్ట్ మోడల్ సింథటిక్ వ్యవసాయ సన్నివేశాలపై శిక్షణ పొందింది, ధృవీకరించబడిన నిజ-ప్రపంచ ఫీల్డ్ ట్రయల్ డేటా కాదు.",
  },
  {
    en: "Risk estimates are EXPERIMENTAL and should not be used as the sole basis for farming decisions.",
    te: "ప్రమాద అంచనాలు ప్రయోగాత్మకం, వ్యవసాయ నిర్ణయాలకు ఏకైక ఆధారంగా ఉపయోగించకూడదు.",
  },
  {
    en: "INR loss figures are INDICATIVE, based on illustrative assumptions about baseline yield and market price — not actual market rates.",
    te: "రూ. నష్టం సూచనమాత్రమే, ప్రాథమిక దిగుబడి మరియు మార్కెట్ ధరపై ఊహాత్మక అంచనాల ఆధారంగా — వాస్తవ మార్కెట్ రేట్లు కావు.",
  },
  {
    en: "Soil moisture is from the 0–1cm SURFACE layer only, which may not represent root-zone moisture.",
    te: "నేల తేమ 0–1cm ఉపరితల పొర మాత్రమే, రూట్-జోన్ తేమను ప్రతిబింబించకపోవచ్చు.",
  },
  {
    en: "This application does NOT claim independently validated prediction accuracy.",
    te: "ఈ అప్లికేషన్ స్వతంత్రంగా ధృవీకరించబడిన అంచనా ఖచ్చితత్వాన్ని ప్రకటించదు.",
  },
];

const DEPLOY = [
  { icon: Github, label: "GitHub", labelTe: "గిట్‌హబ్", value: "Public repository", valueTe: "పబ్లిక్ రిపోజిటరీ" },
  { icon: Server, label: "Render", labelTe: "రెండర్", value: "Python FastAPI backend", valueTe: "పైథాన్ బ్యాకెండ్" },
  { icon: Rocket, label: "Vercel", labelTe: "వెర్సెల్", value: "React frontend", valueTe: "రియాక్ట్ ఫ్రంటెండ్" },
];

export default function About({ lang }: AboutProps) {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Intro */}
      <div className="card-lg p-6">
        <h2 className="font-display font-bold text-2xl text-forest mb-2">{t("about", lang)}</h2>
        <p className="text-charcoal/70 leading-relaxed">{t("aboutDesc", lang)}</p>

        <div className="grid grid-cols-3 gap-3 mt-5">
          {DEPLOY.map((d) => (
            <div key={d.label} className="p-3 rounded-xl bg-offwhite border border-mint/30 text-center">
              <d.icon className="w-6 h-6 text-emerald mx-auto mb-1.5" />
              <div className="text-sm font-semibold text-charcoal">{lang === "te" ? d.labelTe : d.label}</div>
              <div className="text-xs text-charcoal/50">{lang === "te" ? d.valueTe : d.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data sources */}
      <div className="card-lg p-6">
        <h3 className="font-display font-bold text-lg text-charcoal mb-4">{t("dataSources", lang)}</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {SOURCES.map((s) => (
            <div key={s.name} className="flex items-start gap-3 p-4 rounded-xl bg-offwhite border border-mint/30">
              <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-5 h-5 text-emerald" />
              </div>
              <div>
                <div className="font-semibold text-charcoal text-sm">{lang === "te" ? s.nameTe : s.name}</div>
                <div className="text-xs text-charcoal/50 mt-0.5">{lang === "te" ? s.descTe : s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimers */}
      <div className="card-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-dark" />
          <h3 className="font-display font-bold text-lg text-charcoal">{t("disclaimers", lang)}</h3>
        </div>
        <div className="space-y-3">
          {DISCLAIMERS.map((d, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber/5 border border-amber/20">
              <Info className="w-4 h-4 text-amber-dark flex-shrink-0 mt-0.5" />
              <p className="text-sm text-charcoal/80">{d[lang]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
