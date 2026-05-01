# 🗼 Paris Cultural Events — Data Analysis & ML Dashboard

> *Internship admission project — Exploratory Data Analysis on Paris open data, extended with ML prediction models and a live web interface.*

[![Python](https://img.shields.io/badge/Python-3.12+-blue?style=flat-square&logo=python)](https://python.org)
[![Jupyter](https://img.shields.io/badge/Jupyter-Notebook-orange?style=flat-square&logo=jupyter)](https://jupyter.org)
[![Angular](https://img.shields.io/badge/Angular-17+-red?style=flat-square&logo=angular)](https://angular.io)
[![Flask](https://img.shields.io/badge/Flask-API-black?style=flat-square&logo=flask)](https://flask.palletsprojects.com)
[![Dataset](https://img.shields.io/badge/Dataset-Paris%20Open%20Data-blueviolet?style=flat-square)](https://opendata.paris.fr)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-parisevents.onrender.com-green?style=flat-square)](https://parisevents.onrender.com)

---

## 👋 About

I'm a business student with a strong interest in data science. This project was built as part of an **internship admission test** — the core deliverable is a thorough exploratory data analysis of Paris cultural events data.

Going further, I personally challenged myself (*ijtihad*) to take the analysis all the way to trained ML models and a live interactive dashboard. That part wasn't required — it was just the direction my curiosity took me.

**Live dashboard →** [parisevents.onrender.com](https://parisevents.onrender.com)

---

## 📂 Project Structure

```
ParisEvents/
│
├── 📓 notebooks/
│   ├── FinalEDA.ipynb          ← ★ Core deliverable — full exploratory analysis
│   ├── Ml.ipynb                ← Model training (personal extra)
│   └── Report.ipynb            ← Evaluation report (personal extra)
│
├── 🤖 paris-events-api/        ← Flask REST API serving the ML models
├── 🌐 paris-events-frontend/   ← Angular dashboard (live at parisevents.onrender.com)
└── README.md
```

---

## 📊 Core Deliverable — Exploratory Data Analysis (`FinalEDA.ipynb`)

This is the main work. A **complete EDA** on the [Que Faire à Paris](https://opendata.paris.fr/explore/dataset/que-faire-a-paris-/) dataset from the Paris Open Data portal.

### Dataset
- **Source:** Paris Open Data API — *Que Faire à Paris?*
- **Size:** ~145,000 event records across 16 engineered features (originally 69 raw columns)
- **Type:** Real-world cultural events data — exhibitions, concerts, workshops, sports, kids activities, etc.

### What the EDA covers

**1. Data Quality & Cleaning**
- Null value audit across all 69 columns — identifying missingness patterns and deciding what to drop vs. impute
- Duplicate detection and deduplication
- Type correction (dates, booleans, numerics)
- Outlier analysis on price, duration, and session counts

**2. Feature Engineering**
- Parsed `date_start` / `date_end` → `event_duration_days`, `is_weekend`, `month`, `day_of_week`
- Extracted arrondissement from `address_zipcode`
- Parsed raw `occurrences` text → session count, peak hour, session duration
- Binarized `tags` (semicolon-separated categories) into individual feature flags
- Derived `is_indoor` / `is_outdoor` from venue and tag patterns
- Engineered `target_audience` from raw free-text `audience` field into 5 clean categories

**3. Univariate Analysis**
- Distribution of event categories (tags) — which types dominate Paris culture
- Price type distribution (free vs. paid) — with proportions and counts
- Accessibility features: PMR, blind, deaf, sign language, mental accessibility flags
- Temporal distributions: events by month, weekday, and hour of day
- Arrondissement breakdown — which districts host the most events

**4. Bivariate & Multivariate Analysis**
- Price type vs. event category — what kinds of events tend to be free vs. paid
- Audience segment vs. event category — who goes to what
- Duration vs. session count — identifying long-running events vs. one-off sessions
- Indoor/outdoor vs. event type and season
- Correlation matrix on numeric features
- Accessibility features co-occurrence — which events are multi-accessible

**5. Temporal Deep-Dive**
- Event frequency over time — peak seasons for Paris cultural life
- Day-of-week patterns — weekday vs. weekend activity comparison
- Hour-of-day patterns — when events typically start
- Duration anomaly detection — events where theoretical duration vs. actual sessions diverged

**6. Key Insights**
- The majority of Paris cultural events are free (~60%)
- Arts & exhibitions dominate event volume, followed by kids & family activities
- Saturday afternoons see the highest event density
- Arrondissements 1, 4, and 13 are the most event-dense
- Multi-accessibility events are rare but concentrated in specific categories (workshops)
- Session duration has a heavy right-skew — most events are short, but a long tail of cultural festivals run for weeks

---

## 🤖 Personal Extra — ML Models

After completing the EDA, I built two classification models on top of the cleaned dataset. This wasn't required — it was a personal challenge.

### Model 1 — Price Type Classifier
- **Algorithm:** Random Forest
- **Target:** `price_type` → Free or Paid
- **Why:** Binary, class-imbalanced, tree models handle mixed feature types well

### Model 2 — Audience Segment Classifier
- **Algorithm:** Logistic Regression (One-vs-Rest)
- **Target:** `audience` → Kids & Family / Adults / Teens / Seniors / Tout public
- **Why:** Multi-class, linear boundaries interpretable via coefficients

Both are wrapped in full **sklearn Pipelines** with TF-IDF tag vectorization, so deployment is a single `.predict()` call.

---

## 🌐 Personal Extra — Live Dashboard

Built an Angular 17+ single-page app that lets you fill in event details and get instant predictions from both models.

**→ [parisevents.onrender.com](https://parisevents.onrender.com)**

I vibe-coded the entire frontend and Flask API from scratch. First time building a full Angular app — worth it.

> ⚠️ *The API is on Render's free tier — if it hasn't been used recently, the first request takes ~30s to wake up. Normal.*

### Running locally

```bash
# Backend
cd paris-events-api
pip install -r requirements.txt
python app.py          # → http://localhost:5000/health

# Frontend (new terminal)
cd paris-events-frontend
npm install
npm start              # → http://localhost:4200
```

---

## 🛠️ Tech Stack

| Layer | Stack |
|---|---|
| Analysis | Python, Pandas, NumPy, Matplotlib, Seaborn |
| ML | scikit-learn — Random Forest, Logistic Regression, Pipeline, TF-IDF |
| API | Flask, Flask-CORS, Gunicorn |
| Frontend | Angular 17+, TypeScript, Angular Signals |
| Deployment | Render.com |

---

## 📁 Dataset

**[Que Faire à Paris — Paris Open Data](https://opendata.paris.fr/explore/dataset/que-faire-a-paris-/)**  
Published by the City of Paris. Public dataset, updated regularly.

The raw CSV (`paris_events_for_ml.csv`) is excluded from the repo due to size (~34MB). The notebooks load it from the local path.

---

*Amine Fatnassi — Business student, data curious.*
