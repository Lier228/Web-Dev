# Fitness App

Scaffold based on the provided PDF specification. The project contains:

- `backend/` — Django REST API with JWT auth, exercises, workout sessions, weekly stats, and seed command.
- `frontend/` — Angular standalone UI with login, exercise catalog, active session flow, and weekly stats page.

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_fitness_data
python manage.py runserver
```

## Frontend

```bash
cd frontend
npm install
npm start
```

The frontend expects the backend at `http://127.0.0.1:8000/api`.
