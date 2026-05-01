# 🗼 Paris Events AI — ML Prediction Dashboard

> *A business student's dive into data science — built from scratch with real data, real models, and a real interface.*

[![Python](https://img.shields.io/badge/Python-3.12+-blue?style=flat-square&logo=python)](https://python.org)
[![Angular](https://img.shields.io/badge/Angular-17+-red?style=flat-square&logo=angular)](https://angular.io)
[![Flask](https://img.shields.io/badge/Flask-3.0-black?style=flat-square&logo=flask)](https://flask.palletsprojects.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-orange?style=flat-square&logo=scikit-learn)](https://scikit-learn.org)
[![Dataset](https://img.shields.io/badge/Dataset-Paris%20Open%20Data-blueviolet?style=flat-square)](https://opendata.paris.fr)

---

## 👋 About This Project

Hey! I'm a business student who got curious about data science and decided to go all in.

This project is my attempt at building a **complete end-to-end ML pipeline** — from raw open data to trained models to a deployed web interface. No shortcuts. I explored the data, built the models, wrapped them in an API, and designed a frontend to interact with them.

It's messy in some places, experimental in others, and 100% a learning experience. That's the vibe.

---

## 📂 Project Structure

```
ParisEvents/
│
├── 📓 notebooks/
│   ├── FinalEDA.ipynb          ← Exploratory Data Analysis (full deep-dive)
│   ├── Ml.ipynb                ← Model training pipeline (RF + LR)
│   └── Report.ipynb            ← Professional evaluation report with charts
│
├── 🤖 paris-events-api/        ← Flask REST API (deploys on Render)
│   ├── app.py                  ← Main API with /predict/price, /predict/audience
│   ├── models/                 ← Serialized .pkl model files
│   ├── requirements.txt
│   ├── Procfile
│   └── render.yaml
│
├── 🌐 paris-events-frontend/   ← Angular 17+ SPA dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── features/       ← Prediction form + Results card
│   │   │   ├── core/           ← Services, models, interceptors
│   │   │   └── shared/         ← Reusable UI components
│   │   └── styles.scss         ← Global dark theme styles
│   └── angular.json
│
└── README.md
```

---

## 🧠 The Machine Learning Part

### Dataset
- **Source:** [Que Faire à Paris](https://opendata.paris.fr) — Paris Open Data API
- **Size:** ~145,000 event records, 16 engineered features
- **Features used:** tags, booking type, location, accessibility flags, session timing, indoor/outdoor, zipcode

### Model 1 — Price Classifier 💰
> *Can the model predict if an event is free or paid?*

- **Algorithm:** Random Forest Classifier
- **Target:** `price_type` → binary (free / paid)
- **Features:** TF-IDF on tags, temporal features, booking type, location flags
- **Exported as:** `model1_price_classifier.pkl`

### Model 2 — Audience Classifier 👥
> *Who is this event for?*

- **Algorithm:** Logistic Regression (One-vs-Rest)
- **Target:** `audience` → 5 classes (Kids & Family / Adults / Teens / Seniors / Tout public)
- **Features:** Same feature pipeline as Model 1
- **Exported as:** `model2_audience_classifier.pkl`

Both models are wrapped in full **scikit-learn Pipelines** (preprocessing included), so predictions work end-to-end with a single `.predict()` call.

---

## 🔬 Notebooks Breakdown

| Notebook | What's inside |
|----------|--------------|
| `FinalEDA.ipynb` | Full EDA — distributions, null analysis, temporal patterns, bivariate analysis, tag breakdowns |
| `Ml.ipynb` | Feature engineering, pipeline building, GridSearchCV, model training, export |
| `Report.ipynb` | Professional report — confusion matrices, ROC curves, feature importance, side-by-side comparison |

---

## 🚀 The Interface

Built an **Angular 17+** single-page app with a dark Paris-inspired design. You fill in event details and instantly get:

- ✅ **Price prediction** — Free or Paid with confidence %
- 🎯 **Audience prediction** — probability breakdown across 5 audience segments

The frontend talks to the Flask API over REST. It was my first time building a full Angular app from scratch — vibe coding this whole interface was honestly the most fun part.

### Running locally

**Backend:**
```bash
cd paris-events-api
pip install -r requirements.txt
python app.py
# → http://localhost:5000/health
```

**Frontend:**
```bash
cd paris-events-frontend
npm install
npm start
# → http://localhost:4200
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Data Analysis | Python, Pandas, NumPy, Matplotlib, Seaborn |
| Machine Learning | scikit-learn (Random Forest, Logistic Regression, Pipeline, TF-IDF) |
| Backend API | Flask, Flask-CORS, Gunicorn |
| Frontend | Angular 17+, TypeScript, Angular Signals |
| Styling | Vanilla CSS, dark glassmorphism theme |
| Deployment | Render.com (API + static frontend) |

---

## 📊 What I Learned

This project pushed me to actually understand:

- How to clean and explore real-world messy data (the EDA phase was brutal)
- How sklearn Pipelines work and why they matter for deployment
- How to build and evaluate two very different classifier types
- How REST APIs connect ML models to frontend interfaces
- How Angular's reactive forms and HTTP client work
- That vibe coding an entire dashboard at 2am is a valid strategy

---

## 🤝 Dataset Credit

Data from **[Paris Open Data — Que Faire à Paris](https://opendata.paris.fr/explore/dataset/que-faire-a-paris-/)** — a public dataset of cultural events in Paris published by the City of Paris.

---

*Made with curiosity and way too many reruns of `npm start` — Amine*
