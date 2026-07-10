"""
LungGuard AI — Risk Model Training Script
==========================================
Trains a RandomForestRegressor on the smoking_driking_dataset_Ver01.csv
to predict lung risk and liver risk scores.

Dataset columns used:
  sex, age, height, weight, waistline, SBP, DBP, BLDS, tot_chole,
  HDL_chole, LDL_chole, triglyceride, hemoglobin, urine_protein,
  serum_creatinine, SGOT_AST, SGOT_ALT, gamma_GTP, SMK_stat_type_cd, DRK_YN

Usage:
  python -m training.train_risk_model
"""

import os
import sys
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score


def get_project_root():
    """Get the lungguard-ai project root directory."""
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_and_preprocess(csv_path: str) -> pd.DataFrame:
    """Load the smoking/drinking dataset and preprocess it."""
    print(f"Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"  Raw dataset shape: {df.shape}")

    # ── Encode categorical columns ──────────────────────────────────
    # sex: Male → 1, Female → 0
    df['sex'] = df['sex'].map({'Male': 1, 'Female': 0}).fillna(0).astype(int)

    # DRK_YN: Y → 1, N → 0
    df['DRK_YN'] = df['DRK_YN'].map({'Y': 1, 'N': 0}).fillna(0).astype(int)

    # SMK_stat_type_cd: 1=never smoked, 2=used to smoke, 3=currently smokes
    df['SMK_stat_type_cd'] = pd.to_numeric(df['SMK_stat_type_cd'], errors='coerce').fillna(1).astype(int)

    # ── Convert all numeric columns ─────────────────────────────────
    numeric_cols = [
        'age', 'height', 'weight', 'waistline', 'SBP', 'DBP', 'BLDS',
        'tot_chole', 'HDL_chole', 'LDL_chole', 'triglyceride', 'hemoglobin',
        'urine_protein', 'serum_creatinine', 'SGOT_AST', 'SGOT_ALT', 'gamma_GTP'
    ]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # Drop rows with NaN
    df = df.dropna()
    print(f"  Cleaned dataset shape: {df.shape}")

    return df


def engineer_risk_scores(df: pd.DataFrame) -> pd.DataFrame:
    """
    Engineer target variables: lungRiskScore and liverRiskScore (0-100).

    lungRiskScore is derived from:
      - SMK_stat_type_cd (smoking status — dominant factor)
      - age (older → higher risk)
      - SBP (high blood pressure → cardiovascular/pulmonary stress)
      - hemoglobin (abnormal levels → oxygen transport issues)
      - tot_chole (high cholesterol → vascular damage)

    liverRiskScore is derived from:
      - DRK_YN (drinking status — dominant factor)
      - gamma_GTP (elevated → liver damage biomarker)
      - SGOT_AST (elevated → liver enzyme leak)
      - SGOT_ALT (elevated → liver enzyme leak)
      - triglyceride (elevated → fatty liver)
      - age (older → higher risk)
    """
    print("Engineering risk score targets...")

    # ── Lung Risk Score ─────────────────────────────────────────────
    # Smoking status contribution (0-40 points)
    smoking_score = df['SMK_stat_type_cd'].map({1: 0, 2: 15, 3: 40}).fillna(0)

    # Age contribution (0-20 points): scaled linearly from 20 to 85
    age_score = np.clip((df['age'] - 20) / (85 - 20) * 20, 0, 20)

    # SBP contribution (0-15 points): normal ~120, high >=180
    sbp_score = np.clip((df['SBP'] - 100) / (180 - 100) * 15, 0, 15)

    # Hemoglobin deviation (0-15 points): normal male ~15, female ~13
    hemo_normal = np.where(df['sex'] == 1, 15.0, 13.0)
    hemo_dev = np.abs(df['hemoglobin'] - hemo_normal)
    hemo_score = np.clip(hemo_dev / 5.0 * 15, 0, 15)

    # Cholesterol contribution (0-10 points): normal <200, high >300
    chol_score = np.clip((df['tot_chole'] - 150) / (300 - 150) * 10, 0, 10)

    lung_risk = smoking_score + age_score + sbp_score + hemo_score + chol_score
    # Add small noise for regression diversity
    noise = np.random.RandomState(42).normal(0, 2, size=len(df))
    df['lungRiskScore'] = np.clip(lung_risk + noise, 0, 100).astype(int)

    # ── Liver Risk Score ────────────────────────────────────────────
    # Drinking status contribution (0-30 points)
    drink_score = df['DRK_YN'] * 30

    # gamma_GTP contribution (0-25 points): normal <50, elevated >200
    gtp_score = np.clip((df['gamma_GTP'] - 10) / (200 - 10) * 25, 0, 25)

    # SGOT_AST contribution (0-15 points): normal <40, elevated >100
    ast_score = np.clip((df['SGOT_AST'] - 15) / (100 - 15) * 15, 0, 15)

    # SGOT_ALT contribution (0-10 points): normal <40, elevated >100
    alt_score = np.clip((df['SGOT_ALT'] - 10) / (100 - 10) * 10, 0, 10)

    # Triglyceride contribution (0-10 points): normal <150, high >400
    trig_score = np.clip((df['triglyceride'] - 50) / (400 - 50) * 10, 0, 10)

    # Age contribution (0-10 points)
    age_liver_score = np.clip((df['age'] - 20) / (85 - 20) * 10, 0, 10)

    liver_risk = drink_score + gtp_score + ast_score + alt_score + trig_score + age_liver_score
    noise2 = np.random.RandomState(99).normal(0, 2, size=len(df))
    df['liverRiskScore'] = np.clip(liver_risk + noise2, 0, 100).astype(int)

    print(f"  lungRiskScore  — mean: {df['lungRiskScore'].mean():.1f}, std: {df['lungRiskScore'].std():.1f}")
    print(f"  liverRiskScore — mean: {df['liverRiskScore'].mean():.1f}, std: {df['liverRiskScore'].std():.1f}")

    return df


def train_models(df: pd.DataFrame, output_path: str):
    """Train RandomForestRegressor for lung and liver risk scores."""

    # ── Feature selection ───────────────────────────────────────────
    feature_cols = [
        'sex', 'age', 'height', 'weight', 'waistline',
        'SBP', 'DBP', 'BLDS', 'tot_chole', 'HDL_chole', 'LDL_chole',
        'triglyceride', 'hemoglobin', 'urine_protein', 'serum_creatinine',
        'SGOT_AST', 'SGOT_ALT', 'gamma_GTP', 'SMK_stat_type_cd', 'DRK_YN'
    ]

    X = df[feature_cols]
    y_lung = df['lungRiskScore']
    y_liver = df['liverRiskScore']

    # ── Train/Test split ────────────────────────────────────────────
    X_train, X_test, y_lung_train, y_lung_test, y_liver_train, y_liver_test = \
        train_test_split(X, y_lung, y_liver, test_size=0.2, random_state=42)

    print(f"\nTraining set: {X_train.shape[0]} samples")
    print(f"Test set:     {X_test.shape[0]} samples")

    # ── Train Lung Risk Model ───────────────────────────────────────
    print("\n" + "=" * 60)
    print("Training Lung Risk RandomForestRegressor...")
    print("=" * 60)
    lung_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    lung_model.fit(X_train, y_lung_train)

    lung_pred = lung_model.predict(X_test)
    lung_mae = mean_absolute_error(y_lung_test, lung_pred)
    lung_r2 = r2_score(y_lung_test, lung_pred)
    print(f"  Lung Model — MAE: {lung_mae:.2f}, R²: {lung_r2:.4f}")

    # ── Train Liver Risk Model ──────────────────────────────────────
    print("\n" + "=" * 60)
    print("Training Liver Risk RandomForestRegressor...")
    print("=" * 60)
    liver_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    liver_model.fit(X_train, y_liver_train)

    liver_pred = liver_model.predict(X_test)
    liver_mae = mean_absolute_error(y_liver_test, liver_pred)
    liver_r2 = r2_score(y_liver_test, liver_pred)
    print(f"  Liver Model — MAE: {liver_mae:.2f}, R²: {liver_r2:.4f}")

    # ── Save models ─────────────────────────────────────────────────
    model_data = {
        'lung_model': lung_model,
        'liver_model': liver_model,
        'feature_cols': feature_cols,
        'lung_metrics': {'mae': lung_mae, 'r2': lung_r2},
        'liver_metrics': {'mae': liver_mae, 'r2': liver_r2},
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    joblib.dump(model_data, output_path)
    print(f"\n[OK] Models saved to: {output_path}")
    print(f"   File size: {os.path.getsize(output_path) / 1024 / 1024:.1f} MB")


def main():
    project_root = get_project_root()
    csv_path = os.path.join(project_root, "dataset", "smoking_driking_dataset_Ver01.csv")
    output_path = os.path.join(project_root, "saved_models", "risk_model.pkl")

    if not os.path.exists(csv_path):
        print(f"[ERROR] Dataset not found: {csv_path}")
        sys.exit(1)

    print("=" * 60)
    print("  LUNGGUARD — RISK MODEL TRAINING")
    print("=" * 60)

    df = load_and_preprocess(csv_path)

    # Sample for faster training on large datasets (100K is highly representative)
    if len(df) > 100000:
        print(f"  Sampling 100,000 rows from {len(df)} for efficient training...")
        df = df.sample(n=100000, random_state=42).reset_index(drop=True)

    df = engineer_risk_scores(df)
    train_models(df, output_path)

    print("\n" + "=" * 60)
    print("  TRAINING COMPLETE")
    print("=" * 60)


if __name__ == '__main__':
    main()
