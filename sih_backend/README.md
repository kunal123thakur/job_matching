# Internship Matching API

This project is a FastAPI-based backend for an internship matching platform. It uses AI/ML to match candidates with internship opportunities based on their skills.

## Setup

1.  **Create a virtual environment:**

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

2.  **Install the dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

3.  **Set up the environment variables:**

    Create a `.env` file in the `sih_backend` directory and add the following variables:

    ```
    DATABASE_URL="your_database_url"
    GROQ_API_KEY="your_groq_api_key"
    ```

4.  **Run the data loader:**

    This script will create the necessary tables in the database, load the data from the `internship.csv` file, and generate the embeddings.

    ```bash
    python data_loader.py
    ```

## Running the Application

To run the FastAPI application, use the following command:

```bash
uvicorn main:app --reload
```

The application will be available at `http://127.0.0.1:8000`.

## API Endpoints

*   `GET /`: Root endpoint to check if the server is running.
*   `POST /internships/`: Create a new internship.
*   `GET /internships/`: Get a list of all internships.
*   `POST /search/`: Search for internships based on candidate skills.
*   `POST /candidates/`: Create a new candidate profile by uploading a resume and income certificate.

## Testing the API

To test the API endpoints, you can run the `test_api.py` script:

```bash
python test_api.py
```
