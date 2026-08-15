# Virtual Staging SaaS

AI-powered virtual staging platform for small real-estate agencies.

---

## What is this?

A web SaaS that allows small real-estate agencies to transform empty-room photographs into virtually staged images using AI.

Core flow:

Upload
→ Select room
→ Select style
→ Generate
→ Review
→ Download

---

## Target customer

Small real-estate agencies.

Initial ICP:

1–10 agents.

---

## Core product

The product manages:

- organizations;
- users;
- properties;
- rooms;
- images;
- AI generations;
- usage;
- subscriptions.

---

## Stack

### Frontend

Next.js 16

React 19

TypeScript

Tailwind CSS v4

shadcn/ui

### Backend

Supabase

PostgreSQL

Supabase Auth

Supabase Storage

Supabase Edge Functions

### AI

Primary:

FLUX

Fallback:

OpenAI GPT Image 2

### Payments

Stripe

### Hosting

Vercel

### Monitoring

Sentry

### Analytics

PostHog

Vercel Analytics

### Testing

Vitest

Playwright

### CI/CD

GitHub Actions

---

## Repository structure

/app
/components
/features
/lib
/services
/providers
/tests
/docs

---

## Documentation

Read first:

AGENTS.md

Then:

docs/PRODUCT.md
docs/MVP.md
docs/ARCHITECTURE.md
docs/TECH_STACK.md
docs/DATABASE.md
docs/AI.md
docs/BILLING.md
docs/SECURITY.md
docs/DEVELOPMENT.md
docs/ROADMAP.md

---

## Local development

Install dependencies:

pnpm install

Run development server:

pnpm dev

Run lint:

pnpm lint

Run typecheck:

pnpm typecheck

Run unit tests:

pnpm test

Run E2E tests:

pnpm test:e2e

Build:

pnpm build

---

## Environment variables

Never commit secrets.

Use:

.env.local

Production variables must be configured through deployment infrastructure.

---

## Architecture

Single Next.js full-stack application.

Supabase provides:

- database;
- authentication;
- storage;
- edge functions.

AI generation runs asynchronously through jobs.

---

## AI flow

User
→ image upload
→ generation job
→ worker
→ ImageGenerationService
→ ProviderAdapter
→ AI provider
→ output storage
→ generation succeeded
→ UI result.

---

## Security

Multi-tenancy is enforced using Supabase RLS.

Never bypass RLS.

Never expose AI or Stripe secrets.

Storage uses private buckets and signed URLs where appropriate.

---

## Development principles

Prefer:

- simple solutions;
- small changes;
- clear responsibilities;
- tested code;
- documented architecture.

Avoid:

- unnecessary dependencies;
- microservices;
- overengineering;
- large refactors;
- undocumented architecture changes.

---

## MVP definition

The MVP is complete when a real-estate agency can:

1. Register.
2. Log in.
3. Create a property.
4. Upload an empty-room photograph.
5. Select room type.
6. Select style.
7. Generate staging.
8. Review result.
9. Regenerate.
10. Download.

The application must also:

- isolate organizations;
- track usage;
- handle errors;
- support basic billing;
- provide basic analytics;
- provide basic monitoring.

---

## Status

Development phase.

MVP not yet validated commercially.

---

## Product principle

Build the smallest professional product that proves whether small real-estate agencies will repeatedly use and pay for AI virtual staging.
