
import pandas as pd
import numpy as np

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
            if df_converted.dtype == 'float64':

                # Downcast to the smallet float type
                # float64, float32 can be NaN
                df_converted = pd.to_numeric(df[col], errors='coerce', downcast='float')
                if df_converted.notnull().all():  # If there are no NaN values
                    # Safely downcast to the smallest standard integer type
                    df_converted = pd.to_numeric(df_converted, downcast='integer')
                    print(df_converted)
                else:
                    # Convert to nullable integer type to handle NaN values
                    # Select appropriate size manually if necessary (Int64, Int32, etc.)
                    # df_converted = df_converted.astype('Int64')
                    df_converted = convert_to_smallest_nullable_int_type(df_converted)
            df[col] = df_converted
            continue

        # Attempt to convert to datetime
        try:
            df[col] = pd.to_datetime(df[col])
            continue
        except (ValueError, TypeError):
            pass



        # Attempt to convert to timedelta
        try:
            df[col] = pd.to_timedelta(df[col])
            continue
        except (ValueError, TypeError):
            pass

        # Attempt to convert to complex
        try:
            df[col] = df[col].astype('complex128')
            continue
        except (ValueError, TypeError):
            pass

        # Check if the column should be categorical
        if len(df[col].unique()) / len(df[col]) < 0.5:  # Example threshold for categorization
            df[col] = pd.Categorical(df[col])
            continue

    return df

# Datatypes will be saved on the database as 'dtypes'
# Whenever user requests the table, the script opens up the script and apply the saved types though the following function
def apply_types(df, dtypes):
    numerical = ['float64', 'float32', 'Int64', 'Int32', 'Int16', 'Int8']
    for col in df.columns:
        type = dtypes[col]

        if type in numerical:
            # Safely parse to numeric bacuse if the column contains string cannot directly be convertet to Nullable Int
            df_converted = pd.to_numeric(df[col], errors='coerce')
            df[col] = df_converted.astype(type)
            continue

        if type == 'datetime64[ns]':
            df[col] = pd.to_datetime(df[col], errors='coerce')
            continue

        if type == 'timedelta64[ns]':
            df[col] = pd.to_datetime(df[col], errors='coerce')
            continue

        if type == 'bool':
            df[col] = df[col].astype('bool')
            continue

        if type == 'complex':
            df[col] = df[col].astype('complex128')
            continue

        if type == 'category':
            df[col] = pd.Categorical(df[col])
            continue

    return df

def convert_to_smallest_nullable_int_type(col):
    # First, drop NaN values to check the min and max of the remaining values
    min_val = col.min()
    max_val = col.max()

    # Determine the smallest suitable nullable integer type
    if min_val >= np.nan and max_val <= np.nan:  # If the column only contains NA after dropping
        return col.astype('Int64')  # Default to Int64 for consistency
    elif min_val >= -128 and max_val <= 127:
        suitable_type = 'Int8'
    elif min_val >= -32768 and max_val <= 32767:
        suitable_type = 'Int16'
    elif min_val >= -2147483648 and max_val <= 2147483647:
        suitable_type = 'Int32'
    else:
        suitable_type = 'Int64'

    # Convert and return the column with the suitable type
    return col.astype(suitable_type)
