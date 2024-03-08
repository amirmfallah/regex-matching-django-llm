
import pandas as pd

def infer_and_convert_data_types(df):
    for col in df.columns:
        # Skip columns with missing values for type inference
        if df[col].isnull().all():
            continue

        # Convert to boolean if applicable
        if set(df[col].dropna().unique()).issubset({True, False}):
            df[col] = df[col].astype('bool')
            continue

        # Attempt to convert to numeric first
        df_converted = pd.to_numeric(df[col], errors='coerce')
        if not df_converted.isna().all():  # If at least one value is numeric
            df[col] = df_converted
            continue

        # Attempt to convert to datetime
        try:
            df[col] = pd.to_datetime(df[col])
            continue
        except (ValueError, TypeError):
            pass

        # Check if the column should be categorical
        if len(df[col].unique()) / len(df[col]) < 0.5:  # Example threshold for categorization
            df[col] = pd.Categorical(df[col])

    return df