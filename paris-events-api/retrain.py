"""
retrain.py — Re-exports models with classes bound to app.py module.
Run this script once from the paris-events-api/ directory:
    python retrain.py

It reads paris_events_for_ml.csv from the parent directory,
retrains both models, and saves them to models/
"""
import sys
import os

# Make sure we can import from app.py (transformer classes must be
# defined in this module for pickle to resolve them correctly)
sys.path.insert(0, os.path.dirname(__file__))

import warnings
warnings.filterwarnings('ignore')

import pandas as pd
import numpy as np
import joblib

from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold

# Import the custom transformer classes FROM app.py
# This is the critical step — pickle will now resolve them as app.TagBinarizer etc.
from app import TagBinarizer, DayEncoder, BookingEncoder, NumericCleaner

RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)

# ── Column groups ────────────────────────────────────────────────────────────
NUMERIC_COLS  = ['sess_hour', 'session_duration', 'arrondissement', 'lat', 'lon', 'is_weekend']
BINARY_COLS   = ['is_indoor', 'pets_allowed', 'is_paris']
TEXT_COL      = 'title'
TAGS_COL      = 'tags'
DAY_COL       = 'sess_day'
BOOKING_COL   = 'booking'
FEATURE_COLS  = NUMERIC_COLS + BINARY_COLS + [TEXT_COL, TAGS_COL, DAY_COL, BOOKING_COL]


def make_preprocessor():
    return ColumnTransformer([
        ('num',     NumericCleaner(),                              NUMERIC_COLS),
        ('binary',  'passthrough',                                 BINARY_COLS),
        ('tfidf',   TfidfVectorizer(max_features=50, sublinear_tf=True), TEXT_COL),
        ('tags',    TagBinarizer(),                                TAGS_COL),
        ('day',     DayEncoder(),                                  DAY_COL),
        ('booking', BookingEncoder(),                              BOOKING_COL),
    ], remainder='drop')


def load_data():
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'paris_events_for_ml.csv')
    if not os.path.exists(csv_path):
        # Try current working directory
        csv_path = 'paris_events_for_ml.csv'
    print(f"Loading data from: {os.path.abspath(csv_path)}")
    df = pd.read_csv(csv_path, low_memory=False)
    print(f"Full shape: {df.shape}")
    df = df.sample(n=min(25000, len(df)), random_state=RANDOM_STATE).reset_index(drop=True)
    print(f"Working shape: {df.shape}")
    return df


def engineer_targets(df):
    df['price_binary'] = df['price'].map({'gratuit': 'free', 'payant': 'paid', 'gratuit sous condition': 'paid'})
    df = df.dropna(subset=['price_binary', 'target_audience', 'tags', 'title'])
    df['zipcode'] = df['zipcode'].astype(str).str.strip()
    df['arrondissement'] = pd.to_numeric(df['zipcode'], errors='coerce').fillna(0).astype(int) % 100
    df.loc[df['arrondissement'] > 20, 'arrondissement'] = 0
    df['is_weekend'] = df['sess_day'].isin(['Saturday', 'Sunday']).astype(int)
    print(f"\nPrice distribution:\n{df['price_binary'].value_counts()}")
    print(f"\nAudience distribution:\n{df['target_audience'].value_counts()}")
    return df


def train_model1(df):
    print("\n-- Training Model 1: Price Classifier (RandomForest) --")
    X1 = df[FEATURE_COLS].copy()
    y1 = df['price_binary'].copy()
    for c in BINARY_COLS:
        X1[c] = X1[c].astype(int)

    X1_tr, X1_te, y1_tr, y1_te = train_test_split(
        X1, y1, test_size=0.2, stratify=y1, random_state=RANDOM_STATE)
    print(f"Train: {X1_tr.shape} | Test: {X1_te.shape}")

    pipe1 = Pipeline([
        ('prep',   make_preprocessor()),
        ('select', SelectKBest(f_classif, k=60)),
        ('clf',    RandomForestClassifier(n_estimators=100, class_weight='balanced',
                                          random_state=RANDOM_STATE, n_jobs=-1))
    ])

    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=RANDOM_STATE)
    gs1 = GridSearchCV(pipe1,
                       {'clf__max_depth': [20, None], 'clf__min_samples_leaf': [1, 3]},
                       cv=3, scoring='f1_weighted', n_jobs=-1, verbose=1)
    gs1.fit(X1_tr, y1_tr)
    model1 = gs1.best_estimator_
    print(f"Best params: {gs1.best_params_} | F1: {round(gs1.best_score_, 4)}")
    return model1


def train_model2(df):
    print("\n-- Training Model 2: Audience Classifier (LogisticRegression) --")
    X2 = df[FEATURE_COLS].copy()
    y2 = df['target_audience'].copy()
    for c in BINARY_COLS:
        X2[c] = X2[c].astype(int)

    X2_tr, X2_te, y2_tr, y2_te = train_test_split(
        X2, y2, test_size=0.2, stratify=y2, random_state=RANDOM_STATE)
    print(f"Train: {X2_tr.shape} | Test: {X2_te.shape}")

    pipe2 = Pipeline([
        ('prep',   make_preprocessor()),
        ('select', SelectKBest(f_classif, k=60)),
        ('clf',    LogisticRegression(max_iter=500, class_weight='balanced',
                                      random_state=RANDOM_STATE, solver='lbfgs', n_jobs=-1))
    ])

    gs2 = GridSearchCV(pipe2, {'clf__C': [0.1, 1.0, 10.0]},
                       cv=3, scoring='f1_weighted', n_jobs=-1, verbose=1)
    gs2.fit(X2_tr, y2_tr)
    model2 = gs2.best_estimator_
    print(f"Best params: {gs2.best_params_} | F1: {round(gs2.best_score_, 4)}")
    return model2


def main():
    os.makedirs('models', exist_ok=True)

    df = load_data()
    df = engineer_targets(df)

    model1 = train_model1(df)
    model2 = train_model2(df)

    m1_path = os.path.join('models', 'model1_price_classifier.pkl')
    m2_path = os.path.join('models', 'model2_audience_classifier.pkl')

    joblib.dump(model1, m1_path)
    joblib.dump(model2, m2_path)

    print(f"\n[OK] Model 1 saved -> {m1_path}")
    print(f"[OK] Model 2 saved -> {m2_path}")
    print("\nDone! You can now deploy the API.")


if __name__ == '__main__':
    main()
