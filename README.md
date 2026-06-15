# SocialMedia App

Next.js frontend for the SocialMedia internship demo project.

This app connects to the NestJS backend and provides the main social media UI: auth, feed, explore/search, notifications, messages, support chat, profile settings, moderation, and admin screens.

## Features

- Login, signup, logout, session restore, and password reset screens
- Cookie-based auth through the backend API
- Home feed with composer, posts, likes, comments, replies, edit/delete, and reporting
- Explore/search with suggested users
- Follow, block, mute, and report user actions
- Notifications inbox
- Direct messages with smoother chat layout and transitions
- Support chat isolated per signed-in user
- Profile settings, privacy, theme mode, and accent color controls
- Moderator-only moderation area
- Admin-only dashboard
- Cookie consent and login welcome popup
- Custom modals for report/block/delete actions
- Minimal frontend tests for auth state, role rendering, and support-chat isolation

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vitest

## Project Structure

```text
src/app/               app shell, page, global CSS
src/components/        shared UI and feature sections
src/components/home/   dashboard shell, sidebar, tab content
src/components/sections/ feature screens
src/hooks/             auth, posts, chat, notifications, theme controllers
src/lib/               API client, decoders, config, role helpers
src/types/             shared frontend types
public/                static assets
```

## Local Development

Prerequisites:

- Node.js and npm
- Backend running at `http://localhost:3000`

Create the env file:

```bash
copy .env.example .env.local
```

Recommended local values:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_MOCK_LATENCY_MS=250
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Default frontend URL:

```text
http://localhost:3001
```

## Backend Requirement

The backend must be running separately from:

```text
../socialMedia-api
```

Backend env should include:

```env
CLIENT_ORIGIN=http://localhost:3001
```

Frontend env should include:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Demo Accounts

After the backend seed script runs:

```bash
cd ../socialMedia-api
npm run seed:demo
```

Use:

```text
Admin:     admin@example.com / AdminPassword1
Moderator: mod@example.com / ModPassword1
User:      demo@example.com / DemoPassword1
```

Admin users can access the admin dashboard. Moderators can access moderation tools but should not see the admin dashboard.

## Scripts

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run start
```

## GitHub Push

This folder can be pushed as its own frontend repository.

Before pushing, make sure you do not commit:

- `.env.local`
- `.env`
- `node_modules/`
- `.next/`
- `out/`
- `coverage/`

Suggested commands:

```bash
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin <your-frontend-repo-url>
git push -u origin main
```

## Recommended Checks

```bash
npm run lint
npm run test
npm run build
```

Run the backend separately from `../socialMedia-api`.
