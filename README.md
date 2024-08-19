# Web Application for Regex Pattern Matching and Replacement

This project integrates Django as the backend framework with a React frontend, focusing on processing and displaying data with an emphasis on regex pattern matching and replacement using natural language input. The backend leverages Python and Pandas for data processing, ensuring efficient handling of CSV and Excel files. The frontend, built with React, provides a user-friendly interface for uploading datasets, describing patterns in natural language, and displaying the processed data.

## Project Overview

The project comprises three main parts:

1. **Backend Development with Django**:

   - Set up a Django project for data processing.
   - Implement models, views, and URLs to handle data processing logic and user interactions.
   - Create an API endpoint to receive natural language input, convert it to regex using an LLM, and handle the replacement operations.

2. **Frontend Development using React**:

   - Develop a user-friendly interface allowing users to upload CSV/Excel files.
   - Provide input fields for users to describe the pattern they want to match in natural language and specify the replacement value.
   - Display the processed data with the applied replacements in the text columns.

3. **LLM Integration**:
   - Use a Large Language Model (LLM) to convert natural language input into a regex pattern.
   - Ensure the LLM can handle various natural language descriptions accurately.
   - Demonstrate creativity by using LLM for two additional data transformations.

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
3. Rename `.env.example` to `.env` and configure the necessary environment variables:
   ```
   OPENAI_API_KEY="xxxx"
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

The backend will be available at `http://localhost:8000/`.

### Frontend Setup

1. Navigate to the frontend directory from the project root:
   ```
   cd ui
   ```
2. Install the required node modules:
   ```
   npm install
   ```
3. Rename `.env.local.example` to `.env.local` and configure the API URL:
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

This project aims to provide a comprehensive solution for regex pattern matching and replacement using natural language input. The application is designed to be scalable, maintainable, and user-friendly. For best practices, the code is written to be clean, maintainable, and well-documented, including comprehensive error handling and validations in both the backend and frontend.

### Using OpenAI's ChatGPT to Generate Regex Patterns for Columns

The application leverages OpenAI's ChatGPT to convert natural language descriptions into regex patterns. Here’s how the prompt is structured:

1. **System Message**:

   - The system message sets the context for the model, instructing it on how to respond.
   - It specifies the task: generating regex patterns based on an input string and a list of column names.
   - It also instructs the model to provide the replacement value and to only include affected columns.
   - The response should strictly be in JSON format, containing an array of objects where each object specifies a column name, a regex pattern, and a replacement value.

2. **User Message**:
   - The user message provides specific input for the model to process. It includes:
     - An input string that describes the pattern to be matched.
     - A list of column names to be processed.

```python
# Using OpenAI's ChatGPT to generate regex patterns for columns
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": """
            You will receive an input string and a list of column names.
            Generate a regex pattern that matches the description in the input string for each column name.
            Also, provide the replacement value specified in the input. \n
            Only include columns that are affected. \n
            Your response should only contain the JSON array.\n\n
            Below are sample rows from the dataset: \n """ +
            sample_rows +
            '{"result": [{"column": "column_name", "regex": "regex_pattern", "replacement": "replacement"}]} \n You MUST answer with a JSON object that matches the JSON schema above. '
        },
        {"role": "user", "content": f"Input string: {input_string}, Column names: {', '.join(column_names)}"}
    ],
    response_format={ "type": "json_object" }
)
```

### Example Scenario

**Before**:

| name            | email                        | mobile_number        | phone_number         | address                                                      |
| --------------- | ---------------------------- | -------------------- | -------------------- | ------------------------------------------------------------ |
| Danny Hernandez | shensley@yahoo.com           | 187-990-3522         | +1-697-277-9832x6358 | 99647 Jamie Gateway Apt. 751 <br> East Cynthiafurt, RI 34838 |
| Danielle Thomas | ckelly@yahoo.com             | +1-279-009-2083x137  | 468-561-7340x612     | 48169 Anne Prairie Suite 005 <br> Burchstad, SD 98206        |
| James Smith     | rachael99@norris-walker.info | (423)763-6393x44102  | 668.105.1935         | 51502 Scott Road Suite 856 <br> Gomezville, CA 87300         |
| Tiffany Lewis   | lsmith@gmail.com             | 001-636-413-9972x996 | 783.866.3066         | 5138 Martin Locks <br> Maldonadoborough, PA 47211            |
| Samantha Miller | twilliams@yahoo.com          | 001-997-038-3943     | 351.971.4889         | 16073 Brewer Pass Apt. 128 <br> Port Richardside, AR 45166   |

**User Input**:

- **Natural Language**: "Remove numbers from address column, replace mobile numbers with REDACTED, and remove domains from email column"

**After**:

| name            | email     | mobile_number | phone_number         | address                                      |
| --------------- | --------- | ------------- | -------------------- | -------------------------------------------- |
| Danny Hernandez | shensley  | REDACTED      | +1-697-277-9832x6358 | Jamie Gateway Apt. <br> East Cynthiafurt, RI |
| Danielle Thomas | ckelly    | REDACTED      | 468-561-7340x612     | Anne Prairie Suite <br> Burchstad, SD        |
| James Smith     | rachael99 | REDACTED      | 668.105.1935         | Scott Road Suite <br> Gomezville, CA         |
| Tiffany Lewis   | lsmith    | REDACTED      | 783.866.3066         | Martin Locks <br> Maldonadoborough, PA       |
| Samantha Miller | twilliams | REDACTED      | 351.971.4889         | Brewer Pass Apt. <br> Port Richardside, AR   |
