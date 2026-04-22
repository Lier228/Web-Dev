# 2FTA - Project Handoff Document

**Author:** Madiyar

## Project Summary

This project is a fitness tracking web app with a custom Angular frontend and a Django REST backend.

The original backend logic from the handoff project was kept where it mattered most:
- custom `User`
- workout `Session`
- `ExerciseSet`
- `LastSet`
- automatic points calculation

Then the project was refactored and extended to match the course requirements and the final UI:
- authentication was migrated from DRF token auth to JWT
- the backend contract was adapted to the Angular app
- exercise media support was added (`image_url`, `video_url`)
- YouTube exercise viewing was added on the frontend
- session logging UI was added
- weekly stats UI was added
- avatar upload/display was added

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Language | Python 3.13 |
| Framework | Django 6.0.4 |
| API | Django REST Framework 3.17.1 |
| Auth | JWT (`djangorestframework-simplejwt`) |
| CORS | `django-cors-headers` 4.9.0 |
| Database | SQLite (development) |
| Images | Pillow 12.2.0 |

### Frontend

| Layer | Technology |
|---|---|
| Framework | Angular 19.2 |
| Language | TypeScript 5.7 |
| Reactive utilities | RxJS 7.8 |
| Styling | Custom CSS |
| Routing | Angular Router |
| Forms | Template-driven forms with `[(ngModel)]` |

---

## Project Setup

### Backend

```bash
cd 2FTA
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_fitness_data
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000/`

### Frontend

```bash
cd 2FTA\frontend
npm install
npm start
```

Frontend runs at: `http://127.0.0.1:4200/`

---

## Project Structure

```text
2FTA/
├── manage.py
├── requirements.txt
├── db.sqlite3
├── full_db.json
├── media/
├── fitness_backend/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── api/
│   ├── management/
│   │   └── commands/
│   │       └── seed_fitness_data.py
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
└── frontend/
    ├── angular.json
    ├── package.json
    └── src/
        ├── styles.css
        └── app/
            ├── app.component.ts
            ├── app.routes.ts
            ├── core/
            ├── pages/
            ├── services/
            └── shared/
```

---

## What Was Implemented / Changed

### 1. Authentication Refactor

The original backend used DRF token authentication.  
To satisfy the project requirement, authentication was rewritten to JWT.

Implemented:
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- Angular HTTP interceptor that sends `Authorization: Bearer <access_token>`
- frontend logout flow
- frontend handling of expired/invalid JWT

Logout uses refresh-token blacklisting.

---

### 2. Backend Contract Refactor for Angular

The backend was adapted so the Angular frontend could use a simpler and more UI-friendly contract.

Added endpoints:
- `GET /api/exercises/muscles/`
- `POST /api/sessions/start/`
- `GET /api/sessions/current/`
- `GET /api/sessions/exercise-items/`
- `POST /api/sessions/exercise-items/`
- `DELETE /api/sessions/exercise-items/<id>/`
- `GET /api/stats/weekly/`

The original `Session` + `ExerciseSet` logic was preserved under the hood.

---

### 3. Exercise Media Support

The `Exercise` model was extended with media-related fields:
- `image_url`
- `video_url`
- `exercise_type`
- `base_coefficient`
- `is_active`

This enabled:
- YouTube videos for exercise technique
- thumbnail rendering
- better UI cards
- filtering and display by category

---

### 4. Session Item Adapter

The UI logs one exercise entry as:
- exercise
- weight
- reps
- sets
- notes

But the original backend stores individual sets.

To bridge that difference, `batch_id` was added to `ExerciseSet`.

Result:
- one frontend "exercise item" can create multiple backend `ExerciseSet` rows
- rows from the same user action are grouped together
- deleting one frontend item removes the whole grouped batch

---

### 5. Weekly Statistics

Added a weekly stats API specifically for the frontend:
- line chart data for the last 7 days
- muscle distribution by points
- total sessions
- total points

The frontend then derives additional visual metrics such as:
- total lifted volume
- average weight
- sets x reps load

---

### 6. Avatar Support

The backend already had avatar storage in the custom user model.

Final implementation now includes:
- avatar display in the app shell
- avatar upload from the frontend using `PATCH /api/profile/`
- instant profile refresh after upload

---

### 7. Frontend Pages

Implemented/finalized frontend routes:
- `/login`
- `/exercises`
- `/session`
- `/stats`

Main UI features:
- left sidebar navigation
- top profile bar
- custom login/register modal
- video-based exercises page
- session exercise picker with modal logging
- weekly stats page

---

## Database Models

### User (extends `AbstractUser`)

| Field | Type | Notes |
|---|---|---|
| id | int | PK |
| username | string | unique |
| password | string | hashed |
| bio | text | optional |
| avatar | image | optional, stored in `media/avatars/` |

---

### Exercise

| Field | Type | Notes |
|---|---|---|
| id | int | PK |
| name | string | exercise name |
| target_muscle | enum | main muscle category |
| description | text | optional |
| image_url | URL | preview image |
| video_url | URL | YouTube or video link |
| exercise_type | enum | `compound`, `isolation`, `machine`, `bodyweight`, `yoga` |
| base_coefficient | decimal | extra display/config field |
| is_active | bool | used for filtering |

**Muscle groups currently used:**
`chest`, `back`, `biceps`, `triceps`, `shoulders`, `forearm`, `quads`, `glutes`, `hamstrings`, `calves`, `abs`, `yoga`

**Points coefficients:**
```text
chest=1.0
back=1.0
biceps=1.5
triceps=1.5
shoulders=1.7
forearm=1.5
quads=0.7
glutes=0.7
hamstrings=0.7
calves=1.0
abs=1.0
yoga=1.0
```

---

### Session

| Field | Type | Notes |
|---|---|---|
| id | int | PK |
| user | FK -> User | owner |
| date | date | default today |
| start_time | datetime | default now |
| finish_time | datetime | null until finished |
| duration | timedelta | auto-calculated |
| points_sum | int | auto-recalculated |

Extra computed property:
- `status` -> `in_progress` or `completed`

---

### ExerciseSet

| Field | Type | Notes |
|---|---|---|
| id | int | PK |
| session | FK -> Session | parent session |
| exercise | FK -> Exercise | selected exercise |
| batch_id | UUID | groups multiple sets from one frontend action |
| set_number | int | auto-assigned per session+exercise |
| reps | int | entered by user |
| weight_kg | decimal | entered by user |
| points | int | auto-calculated |
| notes | text | optional |
| created_at | datetime | timestamp |

---

### LastSet

| Field | Type | Notes |
|---|---|---|
| id | int | PK |
| user | FK -> User | owner |
| exercise | FK -> Exercise | linked exercise |
| reps | int | last reps |
| weight_kg | decimal | last weight |
| updated_at | datetime | auto-updated |

Unique together:
- `(user, exercise)`

---

## Business Logic Summary

| Logic | Where it happens |
|---|---|
| Password hashing | `RegisterSerializer.create()` via `create_user()` |
| JWT issue | `build_auth_response()` in `views.py` |
| Access control | authenticated endpoints use `IsAuthenticated` |
| Session start | `StartSessionView` |
| Current session lookup | `CurrentSessionView` |
| set_number auto-assign | `ExerciseSet.save()` |
| Points calculation | `ExerciseSet.save()` -> `reps * weight * coefficient` |
| Session total recalc | `Session.recalculate_points()` |
| Session finish | `Session.finish()` |
| LastSet update | session item create / set create / set patch |
| Flat frontend item grouping | `batch_id` + grouped serializer payload |

---

## Authentication

All protected endpoints require:

```text
Authorization: Bearer <access_token>
```

Login response shape:

```json
{
  "access": "...",
  "refresh": "...",
  "user": {
    "id": 1,
    "username": "madiyar"
  }
}
```

Logout request:

```json
{
  "refresh": "<refresh_token>"
}
```

---

## API Reference

Base URL: `http://127.0.0.1:8000/api/`

### Auth

#### POST `/api/auth/register/`
No auth required.

```json
{
  "username": "madiyar",
  "password": "secret123"
}
```

Response:

```json
{
  "id": 1,
  "username": "madiyar"
}
```

#### POST `/api/auth/login/`
No auth required.

```json
{
  "username": "madiyar",
  "password": "secret123"
}
```

Response:

```json
{
  "access": "...",
  "refresh": "...",
  "user": {
    "id": 1,
    "username": "madiyar"
  }
}
```

#### POST `/api/auth/logout/`
Requires auth.

```json
{
  "refresh": "..."
}
```

---

### Profile

#### GET `/api/profile/`

Returns current user profile.

#### PATCH `/api/profile/`

Supports profile changes such as avatar upload.

Typical multipart fields:
- `avatar`
- `bio`

---

### Exercises

#### GET `/api/exercises/muscles/`

Returns the available muscle categories for the frontend carousel/tabs.

#### GET `/api/exercises/`

Optional filter:
- `?muscle=chest`

Returns exercise records with media fields:
- `image_url`
- `video_url`
- `exercise_type`
- `base_coefficient`
- `exercise_muscles`

#### POST `/api/exercises/`
Create exercise.

#### GET `/api/exercises/<id>/`
Get one exercise.

#### PUT/PATCH `/api/exercises/<id>/`
Update exercise.

#### DELETE `/api/exercises/<id>/`
Delete exercise.

#### GET `/api/exercises/<id>/last-set/`
Returns current user's most recent set for that exercise.

---

### Sessions

#### POST `/api/sessions/start/`

Starts a new session if none is active.  
If a session is already active, it returns the current one.

#### GET `/api/sessions/current/`

Returns the current active session or `404` if none exists.

#### GET `/api/sessions/`

Returns all user sessions.

#### GET `/api/sessions/<id>/`

Returns one session.

#### POST `/api/sessions/<id>/finish/`

Finishes the session, sets `finish_time`, calculates `duration`, and leaves `status=completed`.

---

### Session Exercise Items

This is the frontend-friendly adapter layer.

#### GET `/api/sessions/exercise-items/`

Optional:
- `?session_id=<id>`

Returns grouped exercise items for the UI.

#### POST `/api/sessions/exercise-items/`

Request:

```json
{
  "session": 1,
  "exercise": 2,
  "weight_kg": 60,
  "reps": 10,
  "sets": 3,
  "notes": "controlled reps"
}
```

Behavior:
- creates 3 `ExerciseSet` rows
- assigns one shared `batch_id`
- returns one grouped frontend item

#### DELETE `/api/sessions/exercise-items/<id>/`

Deletes the full grouped batch that the selected item belongs to.

---

### Raw Set Endpoints

#### GET/POST `/api/sessions/<session_id>/sets/`

Direct low-level set access.

#### GET/PATCH/DELETE `/api/sets/<id>/`

Direct single-set access.

---

### Statistics

#### GET `/api/stats/`

General stats endpoint with optional period filtering.

#### GET `/api/stats/weekly/`

Frontend-oriented weekly stats endpoint.

Response includes:
- `period`
- `total_sessions`
- `total_points`
- `line_chart`
- `muscle_distribution`

---

## Frontend Overview

### Login Page

Features:
- custom 2FTA-style login/register page
- modal auth form
- JWT login flow
- error handling for invalid credentials and duplicate usernames

### Exercises Page

Features:
- muscle category carousel
- YouTube player for selected exercise
- exercise list with thumbnails
- exercise details
- media-driven exercise browsing

### Session Page

Features:
- start session button
- live timer
- category carousel
- exercise picker cards
- popup logging modal
- add/delete grouped items
- finish session

### Stats Page

Features:
- weekly points line chart
- muscle distribution chart
- total volume chart
- average weight chart
- sets x reps chart

### App Shell

Features:
- sidebar navigation
- top profile bar
- avatar display
- avatar upload button
- logout

---

## Seed Data

Management command added:

```bash
python manage.py seed_fitness_data
```

It creates sample exercises with:
- names
- muscle categories
- YouTube `video_url`
- preview `image_url`
- descriptions
- exercise types

This makes the project demo-ready without manual data entry.

---

## Export / Import Data

Created export file:

`full_db.json`

Import command:

```bash
python manage.py loaddata full_db.json
```

If avatar/media files are needed too, also copy:

`media/`

---

## Notes for Demo / Defense

Key points to say:
- the backend started from an inherited Django project
- the session/set/points core logic was preserved
- authentication was upgraded to JWT to match the requirement
- the backend contract was refactored to support the Angular UI
- exercise media and YouTube integration were added
- grouped exercise-item logic was added for a cleaner frontend
- avatar upload and profile display were implemented
- stats endpoints were adapted for chart rendering

---

## Remaining Optional Improvements

Not required for the current demo, but possible next steps:
- add automated tests for auth/session/stats
- add refresh-token auto-rotation on the frontend
- add exercise CRUD admin UI on the frontend
- add drag/drop or cropping for avatar upload
- add richer charts with a charting library
- add search and pagination for exercises

---

## Final Summary

This final version is no longer just the original backend handoff.

It became a full-stack fitness tracker with:
- JWT authentication
- Angular frontend
- YouTube exercise browsing
- active workout session logging
- automatic point calculation
- weekly statistics
- avatar upload
- exportable project data

Main implemented by: **Madiyar**
