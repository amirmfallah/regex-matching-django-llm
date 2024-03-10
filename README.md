# Django React App

This project integrates Django as the backend framework with a React frontend, focusing on processing and displaying data with an emphasis on data type inference and conversion for datasets. The backend leverages Python and Pandas for data processing, ensuring efficient handling of CSV and Excel files, data type inference, and conversion to appropriate data types. The frontend, built with React, provides a user-friendly interface for uploading datasets, submitting them for processing, and displaying the processed data.

## Demo

Experience the live demo of the application at [https://django-react-app-roan.vercel.app/](https://django-react-app-roan.vercel.app/).

## Project Overview

The project comprises three main parts:

1. **Pandas Data Type Inference and Conversion (Backend Task):** Develop a Python script using Pandas to infer and convert data types in a dataset. The script addresses common issues such as columns defaulting to 'object' dtype and incorrect type inference, optimizing for performance and handling large files.

2. **Django Backend Development:** Setup of a Django project incorporating the Python script for data processing, creation of models, views, URLs, and a backend API to handle data processing logic and user interactions.

3. **Frontend Development using React:** Development of a frontend application that allows users to upload data, submit it for processing, and display the processed data. It offers an option to override inferred data types.

## Setup and Running

### Prerequisites

- Python 3.12
- Pip
- Node.js
- npm or yarn

### Backend Setup

1. Clone the repository and navigate to the project directory.
   ```
   cd api
   ```
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

### Database Setup

To set up the database and apply migrations, follow these steps:

1. Create database migrations:
   ```
   python manage.py makemigrations
   ```
2. Apply migrations to the database:
   ```
   python manage.py migrate
   ```

### Running the Backend

Start the Django development server:

```
python manage.py runserver
```

The frontend will be available at `http://localhost:8000/`.

### Frontend Setup

1. Navigate to the frontend directory from the project root:
   ```
   cd ui
   ```
2. Install the required node modules:
   ```
   npm install
   ```
3. Rename `.env.local.example` to `.env.local` and configure the api url:
   ```
   VITE_API_BASE=http://127.0.0.1:8000/
   ```

### Running the Frontend

Start the React development server:

```
npm run dev
```

The frontend will be available at `http://localhost:5173/`.

## Additional Notes

This project aims to provide a comprehensive solution to data type inference and conversion, ensuring that the application is scalable, maintainable, and user-friendly. For best practices, the code is written to be clean, maintainable, and well-documented, including comprehensive error handling and validations in both the backend and frontend.

### Data Conversion Algorithm

Data conversion mostly take place in the `api/api/utils/dtypes.py` module following the instructions below:

1. **Skip Columns with Only Missing Values**: The algorithm initially checks if a column contains only missing values (`NaN`). If so, it skips the column, avoiding unnecessary processing.

2. **Boolean Conversion**: If a column's unique, non-null values are a subset of `{True, False}`, it's converted to boolean type. This step simplifies the representation of binary data.

3. **Numeric Conversion**:

   - The function first tries to convert the column to a numeric data type (`int` or `float`) using `pd.to_numeric` with `errors='coerce'`. If the conversion is successful (i.e., not all values are `NaN` after conversion), further processing is done to optimize the numeric type.
   - For floating-point numbers, it attempts to downcast the type to the smallest float type (`float32` or `float64`) that can represent the data without loss of information. If the data does not contain any null values, it further tries to downcast to the smallest integer type.
   - For columns with null values, it uses a custom function `convert_to_smallest_nullable_int_type` to determine and apply the most appropriate nullable integer type.

4. **Datetime and Timedelta Conversion**: The function attempts to convert columns to `datetime` or `timedelta` types using `pd.to_datetime` and `pd.to_timedelta`, respectively. These conversions allow for more efficient and intuitive handling of time series data.

5. **Complex Number Conversion**: It tries to convert columns to complex numbers (`complex128`) if applicable. This step is useful for datasets that include complex numerical data.

6. **Categorical Conversion**: If a significant portion of a column's values are unique (less than 50% in this example), the column is converted to a categorical type. This conversion is beneficial for columns with a limited set of repeating values, reducing memory usage and potentially improving performance.

7. **Type Application for Stored Data**: The `apply_types` function is designed to reapply the inferred data types to a DataFrame based on a provided mapping (`dtypes`). This is particularly useful when loading datasets from storage, ensuring that the data types are consistent with previous processing steps.

## Deliverables

- **Source Code:** The complete source code is available in this Git repository.
- **README File:** This README.md file includes instructions for setting up and running the application, along with additional notes about the project.
- **Demo Video:** A short video demonstrating the web app in action is provided through the project overview.
