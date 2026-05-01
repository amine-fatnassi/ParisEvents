# Paris Cultural Events — ML Prediction API

A production-ready Flask REST API that serves two trained scikit-learn ML models for Paris cultural event predictions. Designed for one-click deployment on **Render.com**.

---

## Models

| Model | Algorithm | Predicts | Output |
|---|---|---|---|
| `model1_price_classifier.pkl` | Random Forest | Price type | `free` / `paid` |
| `model2_audience_classifier.pkl` | Logistic Regression | Audience segment | `Kids & Family` / `Adults` / `General Public` |

---

## Local Setup

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/paris-events-api.git
cd paris-events-api
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Add your .env file

Create a `.env` file in the project root:

```env
PORT=5000
DEBUG=true
MODEL_PATH=models
ALLOWED_ORIGINS=*
```

### 3. Run locally

```bash
python app.py
```

Or with gunicorn (Linux/Mac):

```bash
gunicorn app:app --workers 2 --bind 0.0.0.0:5000
```

API will be live at: `http://localhost:5000`

---

## Endpoints

### `GET /health`

Check that the API is running and models are loaded.

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "models_loaded": true,
  "status": "ok",
  "timestamp": "2026-05-01T15:00:00+00:00",
  "version": "1.0"
}
```

---

### `GET /schema`

Returns the full expected input schema with field descriptions and an example.

```bash
curl http://localhost:5000/schema
```

---

### `POST /predict/price`

Predicts whether an event is **free** or **paid**.

```bash
curl -X POST http://localhost:5000/predict/price \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Atelier Peinture pour Enfants",
    "tags": "Enfants;Loisirs;Atelier",
    "booking": "obligatoire",
    "is_indoor": 1,
    "pets_allowed": 0,
    "lat": 48.8566,
    "lon": 2.3522,
    "is_paris": true,
    "zipcode": "75004",
    "sess_day": "Saturday",
    "sess_hour": 14,
    "session_duration": 2.0
  }'
```

Response:
```json
{
  "confidence": 0.87,
  "latency_ms": 12.4,
  "model": "RandomForest",
  "prediction": "free",
  "version": "1.0"
}
```

---

### `POST /predict/audience`

Predicts the target **audience segment** for an event.

```bash
curl -X POST http://localhost:5000/predict/audience \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Atelier Peinture pour Enfants",
    "tags": "Enfants;Loisirs;Atelier",
    "booking": "obligatoire",
    "is_indoor": 1,
    "pets_allowed": 0,
    "lat": 48.8566,
    "lon": 2.3522,
    "is_paris": true,
    "zipcode": "75004",
    "sess_day": "Saturday",
    "sess_hour": 14,
    "session_duration": 2.0
  }'
```

Response:
```json
{
  "confidence": 0.91,
  "latency_ms": 3.1,
  "model": "LogisticRegression",
  "prediction": "Kids & Family",
  "probabilities": {
    "Adults": 0.05,
    "General Public": 0.04,
    "Kids & Family": 0.91
  },
  "version": "1.0"
}
```

---

### `POST /predict/both`

Runs **both models** on the same event and returns combined results.

```bash
curl -X POST http://localhost:5000/predict/both \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Concert Jazz au Parc",
    "tags": "Concert;Musique;Festival",
    "booking": "non",
    "is_indoor": 0,
    "pets_allowed": 1,
    "lat": 48.8530,
    "lon": 2.3499,
    "is_paris": true,
    "zipcode": "75019",
    "sess_day": "Sunday",
    "sess_hour": 16,
    "session_duration": 3.0
  }'
```

Response:
```json
{
  "audience": {
    "confidence": 0.74,
    "model": "LogisticRegression",
    "prediction": "General Public",
    "probabilities": {
      "Adults": 0.21,
      "General Public": 0.74,
      "Kids & Family": 0.05
    }
  },
  "latency_ms": 14.2,
  "price": {
    "confidence": 0.82,
    "model": "RandomForest",
    "prediction": "free"
  },
  "version": "1.0"
}
```

---

### Error Responses

**400 — Missing fields:**
```json
{
  "error": "Missing required fields",
  "missing_fields": ["title", "tags"]
}
```

**500 — Prediction failure:**
```json
{
  "error": "Prediction failed",
  "detail": "<exception message>"
}
```

---

## Render.com Deployment

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — Paris Events API"
git remote add origin https://github.com/YOUR_USERNAME/paris-events-api.git
git push -u origin main
```

> **Important:** Do NOT add `.pkl` files to `.gitignore`. The model files in `models/` must be committed.

### Step 2 — Create Render Web Service

1. Go to [https://render.com](https://render.com) and sign in
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Render will auto-detect `render.yaml` — confirm the settings:
   - **Runtime:** Python
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `gunicorn app:app --workers 2 --timeout 120 --bind 0.0.0.0:$PORT`

### Step 3 — Set Environment Variables

In the Render dashboard → Environment:

| Key | Value |
|---|---|
| `PORT` | `10000` |
| `DEBUG` | `false` |
| `MODEL_PATH` | `models` |
| `ALLOWED_ORIGINS` | `https://your-frontend-domain.com` |

### Step 4 — Deploy

Click **Deploy** and wait ~2 minutes. Your API will be live at:
```
https://paris-events-api.onrender.com
```

Test it immediately:
```bash
curl https://paris-events-api.onrender.com/health
```

---

## Environment Variables Reference

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Port the server listens on |
| `DEBUG` | `false` | Enable Flask debug mode (dev only) |
| `MODEL_PATH` | `models` | Relative path to the directory containing `.pkl` files |
| `ALLOWED_ORIGINS` | `*` | CORS allowed origins. Use specific domain in production |

---

## Project Structure

```
paris-events-api/
├── app.py                          # Main Flask application
├── models/
│   ├── model1_price_classifier.pkl
│   └── model2_audience_classifier.pkl
├── requirements.txt
├── render.yaml                     # Render deployment config
├── Procfile                        # Gunicorn process definition
├── .env                            # Local dev config (not committed)
└── README.md
```

---

## Notes on Render Free Tier

- Free tier services **spin down after 15 minutes of inactivity**. The first request after spin-down takes ~30s (cold start).
- To keep it warm, use a cron job or uptime monitor (e.g. UptimeRobot) to ping `/health` every 10 minutes.
- The `--timeout 120` in the gunicorn command covers the RF model's slightly higher inference time.
