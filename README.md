# Caller Screen

Caller Screen is a web application designed to help sales callers conduct structured conversations, capture prospect information, and track call progress.

## Live Application

- Frontend: https://caller-screen-sand.vercel.app
- Backend: https://caller-screen.onrender.com
- Backend Health Check: https://caller-screen.onrender.com/health

## GitHub Repository

https://github.com/HEMANTH0620/Caller-screen

## Features

- User authentication with Supabase
- Structured calling workflow with eight stages
- Stage-wise outcomes and prospect notes
- Save and track call progress
- Record final call outcomes
- AI-powered call summaries
- Call history

## Eight Calling Stages

1. Opening
2. Purpose
3. Permission
4. Their Business
5. Their Need in Their Words
6. Objection
7. Next Step
8. Close

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| AI | Google Gemini |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

## LLM Usage

Google Gemini - gemini-3.5-flash-lite

Gemini is used to generate AI-powered summaries of completed calls using captured call information, stage outcomes, and prospect notes.

## Database Schema

The Supabase database schema and Row Level Security policies are documented in:

supabase/schema.sql

The database uses user-specific access policies to ensure authenticated users can access only their own calls and associated call stages.

## Environment Variables

Configure the following variables in your local environment.

### Backend (backend/.env)

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY
- FRONTEND_URL

### Frontend (frontend/.env)

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_API_URL

Never commit actual API keys or secret environment variables to GitHub. Use the provided .env.example files as templates.

## Running Locally

### Backend

    cd backend
    npm install
    npm start

### Frontend

    cd frontend
    npm install
    npm run dev

## Deployment

- Frontend deployed on Vercel.
- Backend deployed on Render.
- Database and authentication powered by Supabase.

## Project Purpose

The goal of Caller Screen is to make sales calls more structured and consistent while helping callers capture important prospect information and identify meaningful next steps.
