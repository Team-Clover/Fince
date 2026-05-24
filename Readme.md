# Fince

A full-stack finance management platform for personal and business users, featuring invoice processing, budget planning, analytics, AI-powered financial insights, family finance sharing, and alerting.

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Environment Setup](#environment-setup)
  - [Prerequisites](#prerequisites)
  - [Local Backend Setup](#local-backend-setup)
  - [Local Frontend Setup](#local-frontend-setup)
  - [Demo Environment](#demo-environment)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Deployment](#deployment)
- [Important Notes](#important-notes)

## Overview

Fince is a modern finance web application that combines invoice automation, spending analytics, budget management, AI-assisted financial guidance, family account linking, and notifications. It is built as a modular three-part project with:

- `backend/` — Node.js + Express API and business logic
- `frontend/` — React + Vite single page app
- `aiml/` — AI/ML helper modules for intelligent financial analysis

## Core Features

- User authentication with email/password and wallet login
- Invoice upload with OCR, AI extraction, duplicate detection, and fraud checks
- Manual invoice entry and invoice history management
- Budget creation, tracking, and AI-assisted budget allocation
- Analytics dashboards for spending trends and category distribution
- AI chat and business intelligence features via the `aiml` module
- Alerts for budget thresholds and financial events
- Family finance linking with shared budgets and transactions
- Email notifications for user registration, login, and password reset
- Cloudinary integration for file storage
- In-memory MongoDB fallback for quick demo or development runs

## Architecture

The application is structured as a backend API and a frontend client, with an AI module providing domain-specific processing.

- The backend exposes REST endpoints for authentication, invoice handling, AI interactions, budget management, analytics, and alerts.
- The frontend consumes backend APIs and provides protected routes for authenticated users.
- The `aiml/` module contains AI services, prompt templates, agents, detection logic, and retrieval utilities.

### Backend Flow

- `server.js` starts the HTTP server
- `app.js` initializes middleware, connects to MongoDB, and mounts routes
- `config/db.js` handles MongoDB connection with optional in-memory fallback
- Route handlers are implemented in `backend/controllers`
- Authentication is enforced by `backend/middleware/auth.js`

### Frontend Flow

- `frontend/main.jsx` mounts React and context providers
- `frontend/App.jsx` defines public and protected routes
- `frontend/src/services/api.js` centralizes backend API calls
- `frontend/src/context/AuthContext.jsx` manages authentication state

## Technology Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Multer, Cloudinary, Nodemailer
- Frontend: React, Vite, React Router, Tailwind CSS, React Toastify, Recharts
- AI/ML: Google generative AI client, Tesseract OCR, custom AI services in `aiml`
- Deployment: Render configuration via `render.yaml`

## Folder Structure

### Root

- `Readme.md` — Project documentation
- `render.yaml` — Render deployment configuration
- `package-lock.json` — Root lock file
- `out.json` — Project output file (usage-specific)

### `aiml/`

- `agents/` — AI agent modules for finance recommendations, forecasting, taxation, and narrative generation
- `anomaly/` — Anomaly detection utilities
- `behavior/` — Behavioral and emotional spending analysis
- `embeddings/` — Embedding generation and vector utilities
- `forecasting/` — Forecasting algorithms and trend analysis
- `insights/` — Financial health and recommendation logic
- `prompts/` — AI prompt templates
- `rag/` — Retrieval-assisted generation helpers and semantic search support
- `services/` — AI service wrappers and external model integrations

### `backend/`

- `app.js` — Express app configuration and route mounting
- `server.js` — HTTP server entry point
- `config/`
  - `db.js` — MongoDB connection logic with fallback
  - `cloudinary.js` — Cloudinary config
  - `blockchain.js` — Blockchain-style invoice sealing/verification utilities
  - `email.js` — Nodemailer email helpers and notification functions
  - `multer.js` — File upload configuration
  - `utils.js` — Token generation and helper utilities
- `controllers/` — Business logic for AI, invoice, budget, analytics, alert, and user routes
- `middleware/` — Route protection middleware
- `models/` — Mongoose schemas for users, invoices, budgets, transactions, alerts, and chat
- `routes/` — Express route definitions
- `uploads/` — Local upload storage

### `frontend/`

- `index.html` — Application HTML template
- `vite.config.js` — Vite configuration
- `src/`
  - `main.jsx` — React application entry point
  - `App.jsx` — Route definitions and protected route wrapper
  - `pages/` — Page-level screens for authentication, dashboard, chat, invoices, budgets, and settings
  - `components/` — Shared UI components
  - `Constants/` — App constants and config values
  - `context/` — Authentication and app context providers
  - `services/` — API request utilities
  - `assets/` — Images and static assets
  - `index.css` / `App.css` — Styling and Tailwind imports
- `android/` — Capacitor Android packaging
- `public/` — Static files for production

## Environment Setup

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB connection string for production usage
- Cloudinary account for invoice/image storage
- SMTP credentials for email delivery (optional for production)

### Local Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the variables listed below.

Start the backend:

```bash
npm run dev
```

### Local Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite in your browser.

> Note: The frontend currently uses a hardcoded API endpoint in `frontend/src/services/api.js`. For local development, update `API_URL` there or change the code to use environment variables.

### Demo Environment

- If `MONGO_URI` is not set, `backend/config/db.js` starts an in-memory MongoDB instance.
- If SMTP variables are not provided, the backend can fall back to Nodemailer's test email account.
- This behavior makes it possible to run the app quickly for demo or evaluation without a full production stack.

## Environment Variables

Create `backend/.env` and include:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
EMAIL_FROM=no-reply@fince.com
```

For Render deployment, the frontend may also require a `VITE_API_URL` environment variable.

## Running the Project

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

### Frontend Production Build

```bash
cd frontend
npm run build
```

## Deployment

This project includes `render.yaml` for Render deployment. The recommended deployment requires:

- Backend service from `backend/`
- Frontend service from `frontend/`
- Properly configured environment variables for MongoDB, Cloudinary, and email
- Optional `VITE_API_URL` in frontend if the backend is deployed to a different host

For Render, the frontend service should serve the built `dist` folder and the backend should run `npm start`.

### Notes on Database

- The production backend expects `MONGO_URI` to point to a MongoDB deployment.
- Without it, the app uses an in-memory MongoDB server for temporary storage.

## Important Notes

- The frontend currently uses a hardcoded API endpoint in `frontend/src/services/api.js`. For local or custom deployments, update that value or refactor the frontend to use environment-based API configuration.
- The `aiml/` directory contains AI helper modules used by backend logic; review usage before changing or removing files.
- Add a `.env.example` file for faster onboarding and safer environment setup.

> This README is written specifically for the Fince project. The earlier README example was used only as a structure reference and not copied into this project.

## Recommended Improvements

- Centralize the frontend API base URL using environment variables
- Add `backend/.env.example` for onboarding
- Add typed frontend configuration if the project moves toward TypeScript
- Consider adding tests for key API routes and frontend pages

## Acknowledgement

This README structure is adapted from a professional reference layout for clarity and completeness. The content is specific to the Fince project and its current architecture.
