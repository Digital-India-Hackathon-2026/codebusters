import numpy as np
import pandas as pd
import joblib
import os

def preprocess_df(df):
    """
    Standardize raw categorical text values to numeric values:
    - gender: male -> 1, female/other -> 0
    - alcoholFrequency: never -> 0, monthly -> 1, weekly -> 2, daily -> 3
    - hasCough/hasChestPain/hasBreathlessness: booleans to 1/0
    """
    processed = df.copy()
    
    # Preprocess Gender
    if 'gender' in processed.columns:
        processed['gender'] = processed['gender'].apply(
            lambda x: 1 if str(x).strip().lower() in ['male', 'm', '1'] else 0
        )
        
    # Preprocess Alcohol Frequency
    if 'alcoholFrequency' in processed.columns:
        alc_map = {"never": 0, "monthly": 1, "weekly": 2, "daily": 3}
        processed['alcoholFrequency'] = processed['alcoholFrequency'].apply(
            lambda x: alc_map.get(str(x).strip().lower(), int(x) if str(x).strip().isdigit() else 0)
        )
        
    # Preprocess symptoms
    for sym in ['hasCough', 'hasChestPain', 'hasBreathlessness']:
        if sym in processed.columns:
            processed[sym] = processed[sym].apply(
                lambda x: 1 if str(x).strip().lower() in ['true', 't', 'yes', 'y', '1'] else 0
            )
            
    return processed

def main():
    # Paths
    dataset_path = os.path.join("dataset", "risk_data.csv")
    output_model_path = os.path.join("saved_models", "risk_model.pkl")
    
    os.makedirs("saved_models", exist_ok=True)
    os.makedirs("dataset", exist_ok=True)
    
    # Check if real dataset CSV is provided
    if os.path.exists(dataset_path):
        print(f"Real dataset CSV found at: {dataset_path}. Training on real data...")
        try:
            df = pd.read_csv(dataset_path)
            required_cols = [
                'age', 'gender', 'weight', 'cigarettesPerDay', 'smokingYears', 
                'alcoholFrequency', 'hasCough', 'hasChestPain', 'hasBreathlessness', 
                'lungRiskScore', 'liverRiskScore'
            ]
            
            # Check missing columns
            missing = [col for col in required_cols if col not in df.columns]
            if missing:
                raise ValueError(f"CSV is missing columns: {missing}. Required: {required_cols}")
                
            df_processed = preprocess_df(df)
            
        except Exception as e:
            print(f"Error reading dataset CSV: {e}. Falling back to synthetic training.")
            df_processed = generate_synthetic_data()
    else:
        print(f"No real dataset found at: {dataset_path}. Generating synthetic dataset...")
        df_processed = generate_synthetic_data()
        
    # Split features and targets
    features = ['age', 'gender', 'weight', 'cigarettesPerDay', 'smokingYears', 'alcoholFrequency', 'hasCough', 'hasChestPain', 'hasBreathlessness']
    X = df_processed[features]
    y_lung = df_processed['lungRiskScore']
    y_liver = df_processed['liverRiskScore']
    
    # Train RandomForest Regressors
    from sklearn.ensemble import RandomForestRegressor
    
    print("Training Lung Risk Random Forest Model...")
    lung_model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    lung_model.fit(X, y_lung)
    
    print("Training Liver Risk Random Forest Model...")
    liver_model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    liver_model.fit(X, y_liver)
    
    # Save the models dictionary
    model_data = {
        'lung_model': lung_model,
        'liver_model': liver_model
    }
    joblib.dump(model_data, output_model_path)
    print(f"Models successfully trained and saved to: {output_model_path}")

def generate_synthetic_data():
    np.random.seed(42)
    n_samples = 1500
    
    age = np.random.randint(18, 85, size=n_samples)
    gender_num = np.random.choice([0, 1], size=n_samples, p=[0.5, 0.5])
    weight = np.random.uniform(50.0, 120.0, size=n_samples)
    cigarettesPerDay = np.random.randint(0, 41, size=n_samples)
    smokingYears = np.random.randint(0, 50, size=n_samples)
    smokingYears = np.minimum(smokingYears, np.maximum(0, age - 10))
    alcoholFrequency_num = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.3, 0.4, 0.2, 0.1])
    
    cough_prob = np.clip(0.1 + 0.01 * cigarettesPerDay + 0.005 * smokingYears, 0.0, 0.9)
    hasCough = np.random.binomial(1, cough_prob)
    
    chest_pain_prob = np.clip(0.05 + 0.012 * cigarettesPerDay + 0.006 * smokingYears, 0.0, 0.9)
    hasChestPain = np.random.binomial(1, chest_pain_prob)
    
    breathlessness_prob = np.clip(0.08 + 0.015 * cigarettesPerDay + 0.008 * smokingYears + 0.002 * (weight - 70), 0.0, 0.9)
    hasBreathlessness = np.random.binomial(1, breathlessness_prob)
    
    lungRiskScore = np.clip(
        0.3 * age + 1.4 * cigarettesPerDay + 0.8 * smokingYears + 12 * hasCough + 18 * hasChestPain + 22 * hasBreathlessness + np.random.normal(0, 5, size=n_samples),
        0, 100
    ).astype(int)
    
    liverRiskScore = np.clip(
        0.2 * age + 22 * alcoholFrequency_num + 0.3 * cigarettesPerDay + 0.15 * (weight - 70) + np.random.normal(0, 5, size=n_samples),
        0, 100
    ).astype(int)
    
    df = pd.DataFrame({
        'age': age,
        'gender': gender_num,
        'weight': weight,
        'cigarettesPerDay': cigarettesPerDay,
        'smokingYears': smokingYears,
        'alcoholFrequency': alcoholFrequency_num,
        'hasCough': hasCough,
        'hasChestPain': hasChestPain,
        'hasBreathlessness': hasBreathlessness,
        'lungRiskScore': lungRiskScore,
        'liverRiskScore': liverRiskScore
    })
    
    return df

if __name__ == '__main__':
    main()
