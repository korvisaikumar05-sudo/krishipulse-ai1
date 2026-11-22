# KrishiPulse AI

**Hyperlocal Climate & Micro-Location Yield Intelligence Engine**

A hackathon MVP for Track 2.2: Predictive Climate & Micro-Location Yield Engine. KrishiPulse AI combines real-time Open-Meteo weather data with a Random Forest ML model to predict drought risk, flood risk, and yield loss for Telangana farmers — with an interactive climate simulator and bilingual (English / Telugu) AI advisory.

---

## Features

- **Interactive Telangana map** — click to select exact farm coordinates, or use preset locations (Ranga Reddy, Nalgonda, Warangal).
- **Real weather data** — 7-day Open-Meteo forecast: rainfall, max temperature, evapotranspiration, surface soil moisture.
- **ML risk prediction** — Random Forest trained on synthetic agronomic scenarios predicts drought risk, flood risk, and yield loss.
- **What-if climate simulator** — adjust rainfall and temperature sliders to see how risk changes (no fresh weather requests).
- **Bilingual AI advisory** — Google Gemini generates English + Telugu recommendations, with built-in fallback if unavailable.
- **No login required** — anyone can use the app immediately.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, TypeScript, Tailwind CSS, React-Leaflet, Recharts, Lucide React |
| Backend | Python, FastAPI, NumPy, Pandas, scikit-learn, httpx, google-genai |
| Data | Open-Meteo Forecast API (free, no key required) |
| Deployment | GitHub → Render (backend) + Vercel (frontend) |

---

## Project Structure

```
krishipulse-ai/
├── backend/
│   ├── main.py            # FastAPI app with all endpoints
│   └── requirements.txt   # Python dependencies
├── src/                   # React frontend source
│   ├── components/        # UI components
│   ├── api.ts             # API client
│   ├── types.ts           # TypeScript types
│   ├── i18n.ts            # English/Telugu translations
│   ├── constants.ts       # Presets, crops, stages
│   └── App.tsx            # Main application
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── vercel.json
└── README.md
```

---

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Optional: set Gemini key for AI advisory
export GEMINI_API_KEY="your-key-here"

uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### Frontend

```bash
npm install
export VITE_API_URL="http://localhost:8000"   # or add to .env.local
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check + model status |
| POST | `/api/analyze` | Fetch weather + predict risks for a farm |
| POST | `/api/simulate` | Recalculate risks with modified climate |
| POST | `/api/advisory` | Generate bilingual AI recommendations |

### `/api/analyze` Request
```json
{
  "latitude": 17.385,
  "longitude": 78.4867,
  "crop": "paddy",
  "growthStage": "vegetative"
}
```

### `/api/analyze` Response
```json
{
  "weather": { "total_rainfall": 12.5, "avg_temp_max": 33.2, ... },
  "engineered_features": { "heat_stress": 0.0, ... },
  "feature_vector": [12.5, -0.64, 0.0, ...],
  "predictions": { "drought_risk": 42.3, "flood_risk": 8.1, "yield_loss": 21.5 },
  "risk_levels": { "drought": "moderate", ... },
  "inr_loss_per_acre": 12096,
  "model_info": { ... }
}
```

---

## Deployment

### 1. GitHub

```bash
git init
git add .
git commit -m "KrishiPulse AI MVP"
git remote add origin https://github.com/YOUR_USERNAME/krishipulse-ai.git
git push -u origin main
```

### 2. Render (Backend)

1. Go to [render.com](https://render.com) → New → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**:
     - `GEMINI_API_KEY` (optional, for AI advisory)
     - `CORS_ORIGINS` = `https://your-app.vercel.app,http://localhost:5173`
4. Deploy. Note the URL: `https://krishipulse-ai.onrender.com`

### 3. Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (project root)
   - **Environment Variables**:
     - `VITE_API_URL` = `https://krishipulse-ai.onrender.com`
4. Deploy.

The `vercel.json` handles SPA routing. Update `CORS_ORIGINS` on Render to include your Vercel URL.

---

## Environment Variables

| Variable | Where | Required | Description |
|----------|-------|----------|-------------|
| `VITE_API_URL` | Vercel (frontend) | Yes | Backend URL |
| `GEMINI_API_KEY` | Render (backend) | No | Google Gemini API key for AI advisory |
| `CORS_ORIGINS` | Render (backend) | Yes | Comma-separated allowed origins |
| `PORT` | Render (backend) | Auto | Set by Render |

**Never commit `.env` files.** Add `.env` to `.gitignore`.

---

## Disclaimers

- The Random Forest model is trained on **synthetic** agronomic scenarios, not validated field trial data.
- Risk estimates are **experimental** and should not be the sole basis for farming decisions.
- INR loss figures are **indicative**, based on illustrative assumptions — not actual market rates.
- Soil moisture is from the **0–1cm surface layer** only.
- This application does **not** claim independently validated prediction accuracy.

---

## Credits

- [Open-Meteo](https://open-meteo.com/) — Weather and soil moisture data
- [scikit-learn](https://scikit-learn.org/) — Random Forest implementation
- [Google Gemini API](https://ai.google.dev/) — AI agricultural advisory
- [React-Leaflet](https://react-leaflet.js.org/) & [Leaflet](https://leafletjs.com/) — Interactive mapping
- [OpenStreetMap](https://www.openstreetmap.org/) — Map tiles
