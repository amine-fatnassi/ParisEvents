"""
Paris Cultural Events — ML Prediction API
==========================================
Serves 2 sklearn pipelines via REST endpoints.
Production-ready for Render.com deployment.
"""

import os, time, logging, traceback
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

# ── Custom transformer classes must be importable at load time ─────────────────
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import MultiLabelBinarizer

load_dotenv()

# ─────────────────────────────────────────────────────────────────────────────
# Custom sklearn transformers (must match training code exactly)
# ─────────────────────────────────────────────────────────────────────────────
DAY_MAP = {
    d: i for i, d in enumerate(
        ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    )
}
BOOKING_MAP = {"non": 0, "conseill\u00e9e": 1, "obligatoire": 2}


class TagBinarizer(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.mlb = MultiLabelBinarizer()

    def _split(self, X):
        return [str(x).split(";") for x in X]

    def fit(self, X, y=None):
        self.mlb.fit(self._split(X))
        return self

    def transform(self, X):
        return self.mlb.transform(self._split(X)).astype(float)

    def get_feature_names_out(self, _=None):
        return np.array([f"tag_{c.strip()}" for c in self.mlb.classes_])


class DayEncoder(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        return np.array([[DAY_MAP.get(str(v), -1)] for v in X], dtype=float)

    def get_feature_names_out(self, _=None):
        return np.array(["sess_day_encoded"])


class BookingEncoder(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        return np.array(
            [[BOOKING_MAP.get(str(v).strip(), 0)] for v in X], dtype=float
        )

    def get_feature_names_out(self, _=None):
        return np.array(["booking_encoded"])


class NumericCleaner(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = np.array(X, dtype=float)
        return np.where(np.isfinite(X), X, 0.0)

    def get_feature_names_out(self, input_features=None):
        return np.array(input_features) if input_features is not None else np.array([])


# ─────────────────────────────────────────────────────────────────────────────
# Config & Logging
# ─────────────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger(__name__)

MODEL_PATH = os.getenv("MODEL_PATH", "models")
API_VERSION = "1.0"

# ─────────────────────────────────────────────────────────────────────────────
# Feature schema
# ─────────────────────────────────────────────────────────────────────────────
NUMERIC_COLS = ["sess_hour", "session_duration", "arrondissement", "lat", "lon", "is_weekend"]
BINARY_COLS  = ["is_indoor", "pets_allowed", "is_paris"]
TEXT_COL     = "title"
TAGS_COL     = "tags"
DAY_COL      = "sess_day"
BOOKING_COL  = "booking"
FEATURE_COLS = NUMERIC_COLS + BINARY_COLS + [TEXT_COL, TAGS_COL, DAY_COL, BOOKING_COL]

# Fields the caller must supply (used for validation)
REQUIRED_FIELDS = {
    "title":            (str,   "Event title, e.g. 'Atelier Peinture'"),
    "tags":             (str,   "Semicolon-separated tags, e.g. 'Concert;Festival'"),
    "booking":          (str,   "One of: 'non', 'conseillée', 'obligatoire'"),
    "is_indoor":        (int,   "1 = indoor, 0 = outdoor"),
    "pets_allowed":     (int,   "1 = pets allowed, 0 = no"),
    "lat":              (float, "Latitude, e.g. 48.8566"),
    "lon":              (float, "Longitude, e.g. 2.3522"),
    "is_paris":         (bool,  "True if event is in Paris"),
    "zipcode":          (str,   "Postal code, e.g. '75011'"),
    "sess_day":         (str,   "Day of week: 'Monday' … 'Sunday'"),
    "sess_hour":        (int,   "Session start hour 0–23"),
    "session_duration": (float, "Duration in hours"),
}

SCHEMA_EXAMPLE = {
    "title":            "Atelier Peinture pour Enfants",
    "tags":             "Enfants;Loisirs;Atelier",
    "booking":          "obligatoire",
    "is_indoor":        1,
    "pets_allowed":     0,
    "lat":              48.8566,
    "lon":              2.3522,
    "is_paris":         True,
    "zipcode":          "75004",
    "sess_day":         "Saturday",
    "sess_hour":        14,
    "session_duration": 2.0,
}

# ─────────────────────────────────────────────────────────────────────────────
# Model loading (once at startup)
# ─────────────────────────────────────────────────────────────────────────────
MODELS_LOADED = False
MODEL1 = None  # price classifier
MODEL2 = None  # audience classifier
MODEL1_NAME = "RandomForest"
MODEL2_NAME = "LogisticRegression"


def load_models():
    global MODEL1, MODEL2, MODELS_LOADED
    m1_path = os.path.join(MODEL_PATH, "model1_price_classifier.pkl")
    m2_path = os.path.join(MODEL_PATH, "model2_audience_classifier.pkl")
    if not os.path.exists(m1_path) or not os.path.exists(m2_path):
        logger.warning("Model files not found — skipping load (run retrain.py first).")
        return
    logger.info(f"Loading Model 1 from {m1_path}")
    MODEL1 = joblib.load(m1_path)
    logger.info(f"Loading Model 2 from {m2_path}")
    MODEL2 = joblib.load(m2_path)
    MODELS_LOADED = True
    logger.info("Both models loaded successfully.")


# ─────────────────────────────────────────────────────────────────────────────
# Helper utilities
# ─────────────────────────────────────────────────────────────────────────────
def validate_input(data: dict) -> list[str]:
    """Return list of missing/invalid field names."""
    missing = []
    for field in REQUIRED_FIELDS:
        if field not in data or data[field] is None or str(data[field]).strip() == "":
            missing.append(field)
    return missing


def prepare_row(event: dict) -> pd.DataFrame:
    """Convert raw event dict → single-row DataFrame ready for pipeline."""
    row = {col: event.get(col, None) for col in FEATURE_COLS}
    # Derive arrondissement from zipcode
    try:
        arr = int(str(row.get("zipcode", "75000")).strip()) % 100
        row["arrondissement"] = arr if arr <= 20 else 0
    except Exception:
        row["arrondissement"] = 0
    # Derive is_weekend from sess_day
    row["is_weekend"] = (
        1 if str(row.get("sess_day", "")).strip() in ["Saturday", "Sunday"] else 0
    )
    # Cast binary cols
    for col in BINARY_COLS:
        row[col] = int(bool(row.get(col, 0)))
    return pd.DataFrame([row])


def log_request(endpoint: str, data: dict, result: dict, latency_ms: float):
    logger.info(
        f"endpoint={endpoint} | "
        f"title={str(data.get('title',''))[:40]!r} | "
        f"prediction={result.get('prediction','?')} | "
        f"confidence={result.get('confidence','?')} | "
        f"latency_ms={latency_ms:.1f}"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Flask app
# ─────────────────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, origins=os.getenv("ALLOWED_ORIGINS", "*"))

# Load models at startup
load_models()


# ── Health check ──────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "models_loaded": MODELS_LOADED,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": API_VERSION,
    })


# ── Input schema ──────────────────────────────────────────────────────────────
@app.route("/schema", methods=["GET"])
def schema():
    fields = {
        name: {"type": typ.__name__, "description": desc}
        for name, (typ, desc) in REQUIRED_FIELDS.items()
    }
    return jsonify({
        "required_fields": fields,
        "example": SCHEMA_EXAMPLE,
        "notes": {
            "tags": "Multiple tags separated by semicolons",
            "zipcode": "Paris postcodes start with 75. Arrondissement derived automatically.",
            "sess_day": "Full English weekday name",
        },
    })


# ── Price prediction ──────────────────────────────────────────────────────────
@app.route("/predict/price", methods=["POST"])
def predict_price():
    t0 = time.perf_counter()
    data = request.get_json(force=True, silent=True) or {}

    missing = validate_input(data)
    if missing:
        return jsonify({"error": "Missing required fields", "missing_fields": missing}), 400

    try:
        X = prepare_row(data)
        label = MODEL1.predict(X[FEATURE_COLS])[0]
        proba = MODEL1.predict_proba(X[FEATURE_COLS])[0]
        confidence = float(proba.max())
        latency_ms = (time.perf_counter() - t0) * 1000

        result = {
            "prediction": label,
            "confidence": round(confidence, 4),
            "model": MODEL1_NAME,
            "version": API_VERSION,
            "latency_ms": round(latency_ms, 2),
        }
        log_request("/predict/price", data, result, latency_ms)
        return jsonify(result)

    except Exception as e:
        logger.error(f"/predict/price error: {traceback.format_exc()}")
        return jsonify({"error": "Prediction failed", "detail": str(e)}), 500


# ── Audience prediction ───────────────────────────────────────────────────────
@app.route("/predict/audience", methods=["POST"])
def predict_audience():
    t0 = time.perf_counter()
    data = request.get_json(force=True, silent=True) or {}

    missing = validate_input(data)
    if missing:
        return jsonify({"error": "Missing required fields", "missing_fields": missing}), 400

    try:
        X = prepare_row(data)
        label = MODEL2.predict(X[FEATURE_COLS])[0]
        proba = MODEL2.predict_proba(X[FEATURE_COLS])[0]
        classes = MODEL2.classes_
        confidence = float(proba.max())
        probabilities = {cls: round(float(p), 4) for cls, p in zip(classes, proba)}
        latency_ms = (time.perf_counter() - t0) * 1000

        result = {
            "prediction": label,
            "confidence": round(confidence, 4),
            "probabilities": probabilities,
            "model": MODEL2_NAME,
            "version": API_VERSION,
            "latency_ms": round(latency_ms, 2),
        }
        log_request("/predict/audience", data, result, latency_ms)
        return jsonify(result)

    except Exception as e:
        logger.error(f"/predict/audience error: {traceback.format_exc()}")
        return jsonify({"error": "Prediction failed", "detail": str(e)}), 500


# ── Both predictions ──────────────────────────────────────────────────────────
@app.route("/predict/both", methods=["POST"])
def predict_both():
    t0 = time.perf_counter()
    data = request.get_json(force=True, silent=True) or {}

    missing = validate_input(data)
    if missing:
        return jsonify({"error": "Missing required fields", "missing_fields": missing}), 400

    try:
        X = prepare_row(data)
        Xf = X[FEATURE_COLS]

        # Model 1
        label1 = MODEL1.predict(Xf)[0]
        proba1 = MODEL1.predict_proba(Xf)[0]

        # Model 2
        label2 = MODEL2.predict(Xf)[0]
        proba2 = MODEL2.predict_proba(Xf)[0]
        classes2 = MODEL2.classes_

        latency_ms = (time.perf_counter() - t0) * 1000

        result = {
            "price": {
                "prediction": label1,
                "confidence": round(float(proba1.max()), 4),
                "model": MODEL1_NAME,
            },
            "audience": {
                "prediction": label2,
                "confidence": round(float(proba2.max()), 4),
                "probabilities": {
                    cls: round(float(p), 4) for cls, p in zip(classes2, proba2)
                },
                "model": MODEL2_NAME,
            },
            "version": API_VERSION,
            "latency_ms": round(latency_ms, 2),
        }
        logger.info(
            f"endpoint=/predict/both | price={label1} | audience={label2} | latency_ms={latency_ms:.1f}"
        )
        return jsonify(result)

    except Exception as e:
        logger.error(f"/predict/both error: {traceback.format_exc()}")
        return jsonify({"error": "Prediction failed", "detail": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# Entry point (dev only — gunicorn used in production)
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
