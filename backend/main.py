"""
KrishiPulse AI – Hyperlocal Climate & Micro-Location Yield Intelligence Engine
FastAPI backend.

Endpoints:
  GET  /api/health
  POST /api/analyze
  POST /api/simulate
  POST /api/advisory

The Random Forest model is trained at startup on reproducible synthetic agronomic
scenarios. Risk estimates are EXPERIMENTAL and do NOT represent validated
real-world crop yield observations.
"""

from __future__ import annotations

import os
import json
import math
import logging
from typing import Any

import numpy as np
import pandas as pd
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.ensemble import RandomForestRegressor

# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("krishipulse")

# CORS – comma-separated origins from env, default to permissive for local dev.
_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", _default_origins).split(",") if o.strip()]

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_TIMEOUT = 15.0  # seconds

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_TIMEOUT = 20.0
GEMINI_MODEL = "gemini-2.0-flash-001"

XAI_API_KEY = os.getenv("XAI_API_KEY", "")
XAI_TIMEOUT = 20.0
XAI_MODEL = os.getenv("XAI_MODEL", "grok-3-mini")
XAI_API_URL = "https://api.x.ai/v1/chat/completions"

AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini").strip().lower()

# Indicative economics (NOT validated market rates) used for INR loss illustration.
INDICATIVE_YIELD_PER_ACRE = {
    "paddy": 2400,    # kg/acre baseline
    "cotton": 800,    # kg/acre baseline (lint)
    "chilli": 1500,   # kg/acre baseline (dry)
}
INDICATIVE_PRICE_PER_KG = {
    "paddy": 24,
    "cotton": 70,
    "chilli": 140,
}

# Crop + growth-stage sensitivity multipliers (0–1 scale).
CROP_SENSITIVITY = {
    "paddy": {"drought": 0.85, "flood": 0.95},
    "cotton": {"drought": 0.60, "flood": 0.55},
    "chilli": {"drought": 0.70, "flood": 0.75},
}
STAGE_SENSITIVITY = {
    "sowing": {"drought": 0.80, "flood": 0.50},
    "vegetative": {"drought": 0.65, "flood": 0.55},
    "flowering": {"drought": 0.90, "flood": 0.85},
    "harvest": {"drought": 0.40, "flood": 0.70},
}

VALID_CROPS = list(CROP_SENSITIVITY.keys())
VALID_STAGES = list(STAGE_SENSITIVITY.keys())

# --------------------------------------------------------------------------- #
# Pydantic models
# --------------------------------------------------------------------------- #


class AnalyzeRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    crop: str
    growth_stage: str = Field(..., alias="growthStage")

    class Config:
        populate_by_name = True


class SimulateRequest(BaseModel):
    crop: str
    growth_stage: str = Field(..., alias="growthStage")
    feature_vector: list[float] = Field(..., alias="featureVector")
    extra_rainfall_mm: float = Field(0.0, ge=0, le=200, alias="extraRainfallMm")
    temp_increase_c: float = Field(0.0, ge=0, le=15, alias="tempIncreaseC")

    class Config:
        populate_by_name = True


class AdvisoryRequest(BaseModel):
    crop: str
    growth_stage: str = Field(..., alias="growthStage")
    drought_risk: float = Field(..., ge=0, le=100, alias="droughtRisk")
    flood_risk: float = Field(..., ge=0, le=100, alias="floodRisk")
    yield_loss: float = Field(..., ge=0, le=100, alias="yieldLoss")

    class Config:
        populate_by_name = True


# --------------------------------------------------------------------------- #
# Feature engineering
# --------------------------------------------------------------------------- #

FEATURE_NAMES = [
    "total_rainfall",
    "rainfall_deviation",
    "heat_stress",
    "et_demand",
    "soil_moisture_stress",
    "crop_sensitivity",
    "stage_sensitivity",
]

# Reference 7-day rainfall for Telangana (mm) – long-period approximate.
REFERENCE_RAINFALL_MM = 35.0
# Optimal surface soil moisture (volumetric, ~0–0.4 m³/m³ range from Open-Meteo).
OPTIMAL_SOIL_MOISTURE = 0.25


def build_feature_vector(
    total_rainfall: float,
    t_max_avg: float,
    et0_sum: float,
    soil_moisture_avg: float,
    crop: str,
    growth_stage: str,
) -> list[float]:
    """Engineer the 7-feature climate vector used by the risk model."""
    rainfall_dev = (total_rainfall - REFERENCE_RAINFALL_MM) / max(REFERENCE_RAINFALL_MM, 1.0)
    # Heat stress: rises above 35°C baseline.
    heat_stress = max(0.0, t_max_avg - 35.0) / 10.0
    et_demand = et0_sum / 35.0  # normalise against ~5 mm/day × 7
    soil_moisture_stress = max(0.0, OPTIMAL_SOIL_MOISTURE - soil_moisture_avg) / OPTIMAL_SOIL_MOISTURE
    crop_sens = CROP_SENSITIVITY[crop]["drought"]  # blended proxy
    stage_sens = STAGE_SENSITIVITY[growth_stage]["drought"]
    return [
        round(total_rainfall, 3),
        round(rainfall_dev, 4),
        round(heat_stress, 4),
        round(et_demand, 4),
        round(soil_moisture_stress, 4),
        round(crop_sens, 4),
        round(stage_sens, 4),
    ]


# --------------------------------------------------------------------------- #
# Synthetic training data + model
# --------------------------------------------------------------------------- #


def _generate_synthetic_dataset(n_samples: int = 1200, seed: int = 42) -> pd.DataFrame:
    """Generate reproducible synthetic agronomic scenarios for model training.

    NOTE: This data is synthetically engineered from heuristic agronomic
    relationships; it does NOT represent validated real-world field trials.
    """
    rng = np.random.default_rng(seed)
    rows: list[dict[str, Any]] = []

    for _ in range(n_samples):
        crop = rng.choice(VALID_CROPS)
        stage = rng.choice(VALID_STAGES)

        total_rainfall = float(np.clip(rng.normal(35, 25), 0, 150))
        t_max_avg = float(np.clip(rng.normal(34, 4), 22, 46))
        et0_sum = float(np.clip(rng.normal(30, 10), 5, 70))
        soil_moisture_avg = float(np.clip(rng.normal(0.22, 0.08), 0.02, 0.45))

        fv = build_feature_vector(total_rainfall, t_max_avg, et0_sum, soil_moisture_avg, crop, stage)

        total_rf, rf_dev, heat, et, sm_stress, c_sens, s_sens = fv

        # Heuristic target generation (intentionally simple, transparent).
        drought_base = (
            0.35 * sm_stress
            + 0.30 * heat
            + 0.20 * max(0.0, -rf_dev)
            + 0.15 * et
        )
        drought_risk = drought_base * (0.7 + 0.6 * c_sens) * (0.7 + 0.6 * s_sens)
        drought_risk += rng.normal(0, 3)
        drought_risk = float(np.clip(drought_risk, 0, 98))

        flood_base = (
            0.55 * max(0.0, rf_dev)
            + 0.10 * total_rf / 80.0
            + 0.10 * (1 - sm_stress)
        )
        flood_risk = flood_base * (0.7 + 0.6 * CROP_SENSITIVITY[crop]["flood"]) * (
            0.7 + 0.6 * STAGE_SENSITIVITY[stage]["flood"]
        )
        flood_risk += rng.normal(0, 3)
        flood_risk = float(np.clip(flood_risk, 0, 95))

        yield_loss = 0.45 * drought_risk + 0.35 * flood_risk + rng.normal(0, 4)
        yield_loss = float(np.clip(yield_loss, 0, 90))

        rows.append(
            {
                "total_rainfall": total_rf,
                "rainfall_deviation": rf_dev,
                "heat_stress": heat,
                "et_demand": et,
                "soil_moisture_stress": sm_stress,
                "crop_sensitivity": c_sens,
                "stage_sensitivity": s_sens,
                "drought_risk": drought_risk,
                "flood_risk": flood_risk,
                "yield_loss": yield_loss,
            }
        )

    return pd.DataFrame(rows)


def train_models() -> dict[str, RandomForestRegressor]:
    logger.info("Training Random Forest risk models on synthetic data...")
    df = _generate_synthetic_dataset()
    X = df[FEATURE_NAMES].values
    models: dict[str, RandomForestRegressor] = {}
    for target in ("drought_risk", "flood_risk", "yield_loss"):
        m = RandomForestRegressor(
            n_estimators=120,
            max_depth=8,
            random_state=42,
            n_jobs=-1,
        )
        m.fit(X, df[target].values)
        models[target] = m
        r2 = m.score(X, df[target].values)
        logger.info("  %s model trained (in-sample R²=%.3f)", target, r2)
    logger.info("Model training complete.")
    return models


# --------------------------------------------------------------------------- #
# Weather fetching
# --------------------------------------------------------------------------- #


async def fetch_open_meteo_forecast(lat: float, lon: float) -> dict[str, Any]:
    """Fetch 7-day Open-Meteo forecast for the exact coordinates."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": [
            "precipitation_sum",
            "temperature_2m_max",
            "et0_fao_evapotranspiration",
        ],
        "hourly": [
            "soil_moisture_0_to_1cm",
        ],
        "timezone": "Asia/Kolkata",
        "forecast_days": 7,
    }
    async with httpx.AsyncClient(timeout=OPEN_METEO_TIMEOUT) as client:
        resp = await client.get(OPEN_METEO_FORECAST_URL, params=params)
        resp.raise_for_status()
        return resp.json()


def _summarise_forecast(data: dict[str, Any]) -> dict[str, Any]:
    daily = data.get("daily", {})
    precip = daily.get("precipitation_sum", []) or []
    t_max = daily.get("temperature_2m_max", []) or []
    et0 = daily.get("et0_fao_evapotranspiration", []) or []
    dates = daily.get("time", []) or []

    hourly = data.get("hourly", {})
    sm_hourly = hourly.get("soil_moisture_0_to_1cm", []) or []
    sm_times = hourly.get("time", []) or []

    def _safe(vals: list, agg: str) -> float:
        clean = [v for v in vals if v is not None]
        if not clean:
            return 0.0
        if agg == "sum":
            return float(sum(clean))
        if agg == "avg":
            return float(sum(clean) / len(clean))
        if agg == "max":
            return float(max(clean))
        return 0.0

    total_rainfall = _safe(precip, "sum")
    t_max_avg = _safe(t_max, "avg")
    t_max_peak = _safe(t_max, "max")
    et0_sum = _safe(et0, "sum")
    sm_avg = _safe(sm_hourly, "avg")

    # Build per-day soil moisture averages from hourly readings.
    sm_by_day: list[float | None] = []
    if sm_times and sm_hourly:
        from collections import defaultdict
        day_buckets: dict[str, list[float]] = defaultdict(list)
        for ts, val in zip(sm_times, sm_hourly):
            if val is not None and ts:
                day_buckets[ts[:10]].append(float(val))
        for d in dates:
            vals = day_buckets.get(d, [])
            sm_by_day.append(round(sum(vals) / len(vals), 4) if vals else None)
    else:
        sm_by_day = [None] * len(dates)

    return {
        "dates": dates,
        "daily_precipitation": precip,
        "daily_temp_max": t_max,
        "daily_et0": et0,
        "daily_soil_moisture": sm_by_day,
        "total_rainfall": round(total_rainfall, 2),
        "avg_temp_max": round(t_max_avg, 2),
        "peak_temp_max": round(t_max_peak, 2),
        "total_et0": round(et0_sum, 2),
        "avg_soil_moisture": round(sm_avg, 4),
    }


# --------------------------------------------------------------------------- #
# Prediction helpers
# --------------------------------------------------------------------------- #


def _predict(models: dict[str, RandomForestRegressor], fv: list[float]) -> dict[str, float]:
    arr = np.array(fv, dtype=float).reshape(1, -1)
    drought = float(np.clip(models["drought_risk"].predict(arr)[0], 0, 99))
    flood = float(np.clip(models["flood_risk"].predict(arr)[0], 0, 99))
    yield_loss = float(np.clip(models["yield_loss"].predict(arr)[0], 0, 95))
    return {
        "drought_risk": round(drought, 1),
        "flood_risk": round(flood, 1),
        "yield_loss": round(yield_loss, 1),
    }


def _inr_loss_per_acre(crop: str, yield_loss_pct: float) -> int:
    base_yield = INDICATIVE_YIELD_PER_ACRE.get(crop, 1000)
    price = INDICATIVE_PRICE_PER_KG.get(crop, 50)
    lost_kg = base_yield * (yield_loss_pct / 100.0)
    return int(round(lost_kg * price))


def _risk_level(score: float) -> str:
    if score >= 60:
        return "severe"
    if score >= 35:
        return "moderate"
    if score >= 15:
        return "low"
    return "minimal"


# --------------------------------------------------------------------------- #
# Advisory (Gemini + Grok + fallback)
# --------------------------------------------------------------------------- #


FALLBACK_ADVISORY: dict[str, dict[str, Any]] = {
    "drought": {
        "en": [
            "Apply organic mulch around the base of plants to conserve soil moisture and reduce evaporation.",
            "Switch to light, evening irrigation and use drip or furrow methods to minimise water waste.",
            "Postpone top-dressing fertilisers until adequate soil moisture returns to avoid root burn.",
        ],
        "te": [
            "మొక్కల వేరు భాగంలో సేంద్రీయ పొరలను వేసి నేల తేమను కాపాడండి, ఆవిరిని తగ్గించండి.",
            "సాయంత్రం తేలికగా నీటి పారుదల చేసి, డ్రిప్ లేదా కాలువ పద్ధతిని ఉపయోగించండి.",
            "నేలలో తగిన తేమ వచ్చే వరకు ఎరువులను వాడటం ఆపివేయండి.",
        ],
    },
    "flood": {
        "en": [
            "Clear drainage channels immediately to remove standing water and prevent root suffocation.",
            "Once water recedes, apply a light dose of foliar nutrients to help plants recover from stress.",
            "Monitor for fungal disease over the next week and remove badly damaged plants to stop spread.",
        ],
        "te": [
            "నిలిచివున్న నీటిని తొలగించడానికి కాలువలను వెంటనే శుభ్రం చేయండి.",
            "నీరు తగ్గాక ఆకుల ద్వారా తేలికపాటి పోషకాలను అందించి మొక్కలను కోలుకునేలా చేయండి.",
            "తదుపరి వారంలో శిలీంధ్ర వ్యాధుల కోసం పర్యవేక్షించి పాడైన మొక్కలను తీసివేయండి.",
        ],
    },
    "balanced": {
        "en": [
            "Maintain regular irrigation scheduling aligned with current rainfall to avoid over-watering.",
            "Continue routine scouting for pests and keep field bunds in good repair for the season.",
            "Apply balanced organic compost to sustain steady growth through the current stage.",
        ],
        "te": [
            "ప్రస్తుత వర్షపు పరిస్థితికి అనుగుణంగా క్రమం తప్పకుండా నీటి పారుదల చేయండి.",
            "పురుగుల కోసం రోజువారీ పర్యవేక్షణ కొనసాగించి, పొలం గట్లను బాగు చేయండి.",
            "స్థిరమైన ఎదుగుదల కోసం సమతుల్య సేంద్రీయ ఎరువును వాడండి.",
        ],
    },
}


def _fallback_advisory(drought: float, flood: float, crop: str, stage: str) -> dict[str, Any]:
    if drought >= 35 and drought >= flood:
        key = "drought"
        summary_en = f"Drought stress is the dominant risk ({drought:.0f}%) for {crop} in the {stage} stage."
    elif flood >= 35 and flood > drought:
        key = "flood"
        summary_en = f"Waterlogging / flood risk is elevated ({flood:.0f}%) for {crop} in the {stage} stage."
    else:
        key = "balanced"
        summary_en = f"Conditions are broadly manageable for {crop} in the {stage} stage, with minor residual risks."
    fb = FALLBACK_ADVISORY[key]
    return {
        "summary": summary_en,
        "recommendations_en": fb["en"],
        "recommendations_te": fb["te"],
        "source": "fallback",
    }


def _build_advisory_prompt(req: AdvisoryRequest, summary: str) -> str:
    return (
        "You are an agronomy assistant for smallholder farmers in Telangana, India.\n"
        f"Detected risk summary: {summary}\n"
        f"Crop: {req.crop}  |  Growth stage: {req.growth_stage}\n"
        f"Drought risk: {req.drought_risk}%  |  Flood risk: {req.flood_risk}%  |  Yield loss estimate: {req.yield_loss}%\n\n"
        "Return ONLY valid JSON (no markdown) with these exact keys:\n"
        "{\n"
        '  "summary": "one sentence risk explanation in English",\n'
        '  "recommendations_en": ["three practical low-cost English tips"],\n'
        '  "recommendations_te": ["three corresponding Telugu tips"]\n'
        "}\n"
        "Rules: low-cost, practical, no unverified chemical recommendations, exactly 3 items per list.\n"
    )


def _try_gemini_advisory(req: AdvisoryRequest, fallback: dict[str, Any]) -> dict[str, Any]:
    """Attempt Gemini; on any failure return the fallback advisory."""
    if not GEMINI_API_KEY:
        return fallback

    try:
        from google import genai  # type: ignore
    except Exception as exc:  # pragma: no cover
        logger.warning("google-genai import failed: %s – using fallback advisory.", exc)
        return fallback

    summary = fallback["summary"]
    prompt = _build_advisory_prompt(req, summary)

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeout

        with ThreadPoolExecutor(max_workers=1) as pool:
            future = pool.submit(
                lambda: client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
            )
            response = future.result(timeout=GEMINI_TIMEOUT)
        text = response.text if hasattr(response, "text") else str(response)
    except FuturesTimeout:
        logger.warning("Gemini advisory timed out after %.0fs – using fallback.", GEMINI_TIMEOUT)
        return fallback
    except Exception as exc:  # broad: covers rate-limit, http, auth, parse
        logger.warning("Gemini advisory failed (%s) – using fallback.", type(exc).__name__)
        return fallback

    # Parse JSON robustly.
    try:
        # Strip code fences if present.
        clean = text.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1] if "\n" in clean else clean
            clean = clean.rsplit("```", 1)[0]
        parsed = json.loads(clean)
        if not all(k in parsed for k in ("summary", "recommendations_en", "recommendations_te")):
            raise ValueError("missing keys")
        if not (isinstance(parsed["recommendations_en"], list) and isinstance(parsed["recommendations_te"], list)):
            raise ValueError("recommendations must be lists")
        parsed["source"] = "gemini"
        return parsed
    except Exception:
        logger.warning("Gemini returned unparseable JSON – using fallback advisory.")
        return fallback


def _try_grok_advisory(req: AdvisoryRequest, fallback: dict[str, Any]) -> dict[str, Any]:
    """Attempt Grok (xAI); on any failure return the fallback advisory."""
    if not XAI_API_KEY:
        logger.warning("XAI_API_KEY not set – cannot use Grok provider.")
        return fallback

    summary = fallback["summary"]
    prompt = _build_advisory_prompt(req, summary)

    try:
        with httpx.Client(timeout=XAI_TIMEOUT) as client:
            resp = client.post(
                XAI_API_URL,
                headers={
                    "Authorization": f"Bearer {XAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": XAI_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an agronomy assistant. Return only valid JSON, no markdown.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.7,
                    "max_tokens": 800,
                },
            )
            resp.raise_for_status()
            data = resp.json()
        text = data["choices"][0]["message"]["content"]
    except Exception as exc:
        logger.warning("Grok advisory failed (%s) – using fallback.", type(exc).__name__)
        return fallback

    try:
        clean = text.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1] if "\n" in clean else clean
            clean = clean.rsplit("```", 1)[0]
        parsed = json.loads(clean)
        if not all(k in parsed for k in ("summary", "recommendations_en", "recommendations_te")):
            raise ValueError("missing keys")
        if not (isinstance(parsed["recommendations_en"], list) and isinstance(parsed["recommendations_te"], list)):
            raise ValueError("recommendations must be lists")
        parsed["source"] = "grok"
        return parsed
    except Exception:
        logger.warning("Grok returned unparseable JSON – using fallback advisory.")
        return fallback


def _try_ai_advisory(req: AdvisoryRequest, fallback: dict[str, Any]) -> dict[str, Any]:
    """Route to the configured AI provider; fall back if the key is missing or the call fails."""
    provider = AI_PROVIDER
    if provider == "grok":
        logger.info("Advisory provider: grok")
        return _try_grok_advisory(req, fallback)
    if provider == "gemini":
        logger.info("Advisory provider: gemini")
        return _try_gemini_advisory(req, fallback)
    logger.warning("Unknown AI_PROVIDER '%s' – using fallback advisory.", provider)
    return fallback


# --------------------------------------------------------------------------- #
# FastAPI app
# --------------------------------------------------------------------------- #

app = FastAPI(
    title="KrishiPulse AI API",
    description="Hyperlocal Climate & Micro-Location Yield Intelligence Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Train models once at startup.
MODELS = train_models()


@app.get("/api/health")
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "krishipulse-ai",
        "models_trained": list(MODELS.keys()),
        "ai_provider": AI_PROVIDER,
        "gemini_configured": bool(GEMINI_API_KEY),
        "grok_configured": bool(XAI_API_KEY),
        "cors_origins": CORS_ORIGINS,
    }


def _validate_crop_stage(crop: str, growth_stage: str) -> None:
    if crop not in VALID_CROPS:
        raise HTTPException(status_code=422, detail=f"Invalid crop '{crop}'. Valid: {VALID_CROPS}")
    if growth_stage not in VALID_STAGES:
        raise HTTPException(status_code=422, detail=f"Invalid growth stage '{growth_stage}'. Valid: {VALID_STAGES}")


@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest) -> dict[str, Any]:
    _validate_crop_stage(req.crop, req.growth_stage)

    try:
        raw = await fetch_open_meteo_forecast(req.latitude, req.longitude)
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=502, detail=f"Weather API error: {exc.response.status_code}")
    except (httpx.TimeoutException, httpx.ConnectError) as exc:
        raise HTTPException(status_code=504, detail=f"Weather API unreachable: {type(exc).__name__}")

    wx = _summarise_forecast(raw)

    fv = build_feature_vector(
        wx["total_rainfall"],
        wx["avg_temp_max"],
        wx["total_et0"],
        wx["avg_soil_moisture"],
        req.crop,
        req.growth_stage,
    )
    preds = _predict(MODELS, fv)

    return {
        "location": {"latitude": req.latitude, "longitude": req.longitude},
        "crop": req.crop,
        "growth_stage": req.growth_stage,
        "weather": wx,
        "engineered_features": dict(zip(FEATURE_NAMES, fv)),
        "feature_vector": fv,
        "predictions": preds,
        "risk_levels": {
            "drought": _risk_level(preds["drought_risk"]),
            "flood": _risk_level(preds["flood_risk"]),
            "yield_loss": _risk_level(preds["yield_loss"]),
        },
        "inr_loss_per_acre": _inr_loss_per_acre(req.crop, preds["yield_loss"]),
        "model_info": {
            "type": "RandomForestRegressor",
            "n_estimators": 120,
            "training_data": "synthetic agronomic scenarios (1200 rows, seed=42)",
            "disclaimer": "Risk estimates are experimental and derived from synthetic training data, not validated field trials.",
        },
        "data_source": "Open-Meteo Forecast API",
    }


@app.post("/api/simulate")
async def simulate(req: SimulateRequest) -> dict[str, Any]:
    _validate_crop_stage(req.crop, req.growth_stage)

    if len(req.feature_vector) != len(FEATURE_NAMES):
        raise HTTPException(
            status_code=422,
            detail=f"feature_vector must have {len(FEATURE_NAMES)} elements, got {len(req.feature_vector)}",
        )

    fv = list(req.feature_vector)

    # Apply simulated climate deltas.
    # 0 total_rainfall, 1 rainfall_deviation, 2 heat_stress, 3 et_demand,
    # 4 soil_moisture_stress, 5 crop_sensitivity, 6 stage_sensitivity
    new_rainfall = max(0.0, fv[0] + req.extra_rainfall_mm)
    fv[0] = round(new_rainfall, 3)
    new_dev = (new_rainfall - REFERENCE_RAINFALL_MM) / max(REFERENCE_RAINFALL_MM, 1.0)
    fv[1] = round(new_dev, 4)
    # Temperature increase raises heat stress and ET demand.
    fv[2] = round(max(0.0, fv[2] + req.temp_increase_c / 10.0), 4)
    fv[3] = round(fv[3] + req.temp_increase_c * 0.06, 4)
    # Extra rainfall reduces soil-moisture stress (more water available).
    sm_relief = min(0.35, req.extra_rainfall_mm / 200.0)
    fv[4] = round(max(0.0, fv[4] - sm_relief), 4)

    preds = _predict(MODELS, fv)
    inr = _inr_loss_per_acre(req.crop, preds["yield_loss"])

    return {
        "crop": req.crop,
        "growth_stage": req.growth_stage,
        "scenario": {
            "extra_rainfall_mm": req.extra_rainfall_mm,
            "temp_increase_c": req.temp_increase_c,
            "hypothetical": True,
        },
        "modified_feature_vector": fv,
        "predictions": preds,
        "risk_levels": {
            "drought": _risk_level(preds["drought_risk"]),
            "flood": _risk_level(preds["flood_risk"]),
            "yield_loss": _risk_level(preds["yield_loss"]),
        },
        "inr_loss_per_acre": inr,
        "label": "Hypothetical scenario — not a forecast.",
    }


@app.post("/api/advisory")
async def advisory(req: AdvisoryRequest) -> dict[str, Any]:
    _validate_crop_stage(req.crop, req.growth_stage)
    fallback = _fallback_advisory(req.drought_risk, req.flood_risk, req.crop, req.growth_stage)
    result = _try_ai_advisory(req, fallback)
    return result


@app.get("/")
async def root() -> dict[str, str]:
    return {"service": "KrishiPulse AI API", "docs": "/docs", "health": "/api/health"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=False)
