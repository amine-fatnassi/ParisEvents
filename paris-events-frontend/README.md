# Paris Events AI — Frontend

A modern, responsive Angular 17+ single-page application built with **Tailwind CSS** and **Angular Signals**. It consumes the Paris Events ML API to provide real-time predictions for event pricing and target audiences.

---

## Features

- **Real-time Inference**: Connects to the Flask backend to decode cultural signals.
- **Dynamic Input**: Form fields aligned with the ML model's internal schema.
- **Rich Visuals**: 
  - Glassmorphic UI design.
  - Animated confidence bars.
  - Probability breakdown for audience segments.
- **API Inspector**: View the raw schema requirements directly from the backend.

---

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Open `src/environments/environment.ts` and ensure the `apiUrl` points to your running Flask server (default: `http://localhost:5000`).

### 3. Start Dev Server
```bash
ng serve
```
Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

---

## Production Deployment

### 1. Configure Production URL
Update `src/environments/environment.prod.ts` with your deployed Render API URL.

### 2. Render Static Site Setup
1. Create a **Static Site** on Render.
2. Connect your repository.
3. Build Command: `npm run build`
4. Publish Directory: `dist/paris-events-frontend/browser`
5. Add a **Rewrite Rule**: `/*` → `/index.html` (Status 200).

---

## Tech Stack

- **Framework**: Angular 17+ (Standalone Components, Signals, Router, HttpClient)
- **Styling**: Tailwind CSS, SCSS
- **Design**: Dark theme, glassmorphism, Inter font
- **Icons**: Lucide-inspired SVG, Emojis
