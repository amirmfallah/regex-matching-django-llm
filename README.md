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

### Running the Frontend

Start the React development server:

```
npm run dev
```

The frontend will be available at `http://localhost:5173/`.

## Additional Notes

This project aims to provide a comprehensive solution to data type inference and conversion, ensuring that the application is scalable, maintainable, and user-friendly. For best practices, the code is written to be clean, maintainable, and well-documented, including comprehensive error handling and validations in both the backend and frontend.

## Deliverables

- **Source Code:** The complete source code is available in this Git repository.
- **README File:** This README.md file includes instructions for setting up and running the application, along with additional notes about the project.
- **Demo Video:** A short video demonstrating the web app in action is provided through the project overview.
