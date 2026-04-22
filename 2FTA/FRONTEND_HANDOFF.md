from weasyprint import HTML

# Content for the comprehensive Frontend Handoff Document
handoff_content = """
# Fitness App — Comprehensive Frontend Documentation

This document provides a complete overview of the frontend application, its architecture, integration points, and recent critical updates.

---

## 🏗 Tech Stack & Architecture
* **Framework:** Angular 18 (Standalone Components)
* **Design System:** Custom Dark Theme
* **Typography:** * `Orbitron`: Used for headers, timers, and high-tech elements.
    * `Saira`: Used for body text and descriptions.
* **Communication:** REST API with Token Authentication.

---

## 📂 Project Structure & Key Files

### 1. Core Directories
* `src/app/core/`: Contains TypeScript models (`api.models.ts`) that define the structure of Exercises, Sessions, and Sets.
* `src/app/services/`: Contains `api.service.ts` — the central hub for all HTTP calls to the Django backend.
* `src/app/shared/`: Reusable UI components like `LoopCarouselComponent` and `ExerciseLogModalComponent`.
* `src/app/pages/`: Main application views (e.g., `SessionPageComponent`).

### 2. Static Assets & Public Folder
* `src/index.html`: The entry point. It manages the Favicon and global meta tags.
* `public/` & `src/assets/`: Stores images, icons, and the site logo (`2fta_logo.png`).
* **Note:** The project is configured to serve `2fta_logo.png` directly from the root for SEO and browser compatibility.

---

## 🎨 UI & Component Logic

### 1. Session Management (`SessionPageComponent`)
This is the heart of the app. It handles the active workout flow:
* **Timer Logic:** Calculates elapsed time in real-time, including support for "Pause" and "Resume" functionality without losing accuracy.
* **Exercise Rails:** A loop-carousel that displays exercises filtered by muscle group.
* **Session Log:** A dynamic list of exercises added during the current session, allowing for real-time deletion and point recalculation.

### 2. Layout Fixes (Recent Updates)
* **Card Typography:** Fixed an issue where exercise names and types would overlap. Now uses a vertical flex layout with `text-overflow: ellipsis` for long titles.
* **Visual Polish:** Cards use a glassmorphism effect (semi-transparent backgrounds with blurs) to match the dark aesthetic.

---

## 🔌 API Integration Details

The frontend communicates with the Django backend at `http://127.0.0.1:8000/api/`.

### Authentication Flow
1.  **Login/Register:** User receives a token.
2.  **Storage:** The token must be included in the `Authorization` header for all subsequent requests:
    `Authorization: Token <key>`

### Key Workflows
* **Starting a Session:** Triggers `POST /api/sessions/`. The UI then switches to "In Progress" mode.
* **Logging a Set:** Opens a modal to input weight and reps. This triggers `POST /api/sessions/<id>/sets/`.
* **Exercise Search:** Filters exercises by muscle group using `GET /api/exercises/?muscle=<code_name>`.

---

## ⚙️ Configuration & Build

### Asset Pipeline (`angular.json`)
The build configuration is set up to ensure the custom logo is available at the root level:
```json
"assets": [
  "src/2fta_logo.png",
  "src/assets",
  { "glob": "**/*", "input": "public", "output": "/" }
]