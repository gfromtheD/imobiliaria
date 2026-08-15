# MASTER.md

# VIRTUAL STAGING SAAS
## Master Project Specification

---

# 0. PURPOSE

This document is the highest-level operational specification for the project.

It defines:

- what we are building;
- who it is for;
- what the MVP contains;
- how the system is architected;
- which technologies are approved;
- how agents must work;
- in what order the product must be built;
- what constitutes completion.

This document must not contain every implementation detail.

Instead, it tells the agent:

> what to build, where to look for details, and which rules cannot be violated.

---

# 1. PRODUCT

We are building a web SaaS for small real-estate agencies.

Initial ICP:

1–10 agents.

The product uses AI to virtually stage empty-room real-estate photographs.

Core transformation:

EMPTY PROPERTY PHOTO
→
AI VIRTUAL STAGING
→
MARKETING-READY IMAGE

---

# 2. CORE USER FLOW

The complete MVP flow is:

REGISTER
↓
CREATE / ACCESS ORGANIZATION
↓
CREATE PROPERTY
↓
ADD ROOM
↓
UPLOAD IMAGE
↓
SELECT ROOM TYPE
↓
SELECT STYLE
↓
GENERATE
↓
JOB PROCESSING
↓
RESULT
↓
BEFORE / AFTER
↓
REGENERATE IF NECESSARY
↓
DOWNLOAD

This flow is the centre of the product.

---

# 3. PRODUCT RULE

The application is NOT:

- a CRM;
- a property portal;
- a full marketing platform;
- an image editor;
- a 3D platform;
- a marketplace.

The MVP is:

> A professional AI virtual staging tool for small real-estate agencies.

---

# 4. MVP SCOPE

## INCLUDED

- authentication;
- organizations;
- users;
- properties;
- rooms;
- image upload;
- room selection;
- style selection;
- AI generation;
- asynchronous jobs;
- results;
- before/after;
- regeneration;
- downloads;
- usage tracking;
- automatic organization creation on signup;
- free trial credits (3 per organization, no card required);
- basic credits;
- Stripe billing;
- analytics;
- monitoring;
- security.

## EXCLUDED

- CRM;
- mobile app;
- automatic portal publishing;
- 3D;
- AR;
- video;
- advanced editor;
- public API;
- marketplace;
- complex enterprise features;
- white label;
- advanced team management.

---

# 5. ARCHITECTURE

The MVP uses:

Next.js
+
Supabase
+
external AI provider
+
Stripe
+
Vercel.

No microservices.

No separate backend.

No external queue unless required later (no Redis, no BullMQ, no Kafka).

Worker:

Supabase Edge Functions.

Job scheduler:

pg_cron (PostgreSQL) executes process_jobs(), which invokes the Edge Function worker.

Vercel remains the Next.js deployment environment.

---

# 6. STACK

Frontend:

Next.js 16
React 19
TypeScript
Tailwind CSS v4
shadcn/ui

Backend:

Next.js full-stack
Supabase

Database:

PostgreSQL

Auth:

Supabase Auth

Storage:

Supabase Storage

AI:

Provider candidates (decision pending validation):
OpenAI Images API (GPT Image 2)
FLUX

Both integrate via ProviderAdapter.
Credentials come exclusively from environment variables.
A mock adapter allows full development without API keys.

Worker:

Supabase Edge Functions

pg_cron (PostgreSQL job scheduler)

Payments:

Stripe

Hosting:

Vercel

Monitoring:

Sentry

Analytics:

PostHog
Vercel Analytics

Testing:

Vitest
Playwright

CI:

GitHub Actions

---

# 7. DOCUMENT HIERARCHY

The project documentation is divided by responsibility.

## PRODUCT.md

Defines:

- product;
- customer;
- problem;
- scope;
- product principles.

Use when deciding:

"Should this feature exist?"

---

## MVP.md

Defines:

- MVP functionality;
- included features;
- excluded features;
- acceptance criteria.

Use when deciding:

"Does this belong in version 1?"

---

## ARCHITECTURE.md

Defines:

- system architecture;
- layers;
- data flow;
- services;
- provider abstraction;
- boundaries.

Use when deciding:

"Where should this code live?"

---

## TECH_STACK.md

Defines:

- approved technologies;
- frameworks;
- services;
- testing tools.

Use when deciding:

"What technology should we use?"

---

## DATABASE.md

Defines:

- entities;
- relationships;
- RLS;
- database rules.

Use when deciding:

"How should this data be represented and protected?"

---

## AI.md

Defines:

- AI providers;
- generation flow;
- adapters;
- jobs;
- prompts;
- provider errors and retries.

Use when modifying image generation.

---

## BILLING.md

Defines:

- Stripe;
- subscriptions;
- credits;
- entitlement;
- usage.

Use when modifying payment or consumption logic.

---

## SECURITY.md

Defines:

- secrets;
- RLS;
- uploads;
- storage;
- rate limits;
- privacy.

Use when modifying security-sensitive code.

---

## DEVELOPMENT.md

Defines:

- environments;
- Git;
- tests;
- CI/CD;
- development process.

Use when implementing and shipping.

---

## AGENTS.md

Defines:

- direct agent instructions;
- prohibited behaviour;
- workflow;
- coding boundaries.

Read this FIRST.

---

## ROADMAP.md

Defines:

- implementation order;
- phases;
- 7-day target;
- post-MVP evolution.

Use to determine:

"What should we build next?"

---

## TECHNICAL_DECISIONS.md

Defines:

- the decision register;
- decision statuses (APPROVED / PROVISIONAL / PENDING VALIDATION);
- open technical questions.

Use when deciding:

"Is this decision settled, or still pending validation?"

---

## README.md

Defines:

- project entry point;
- quick setup;
- project overview.

---

# 8. SOURCE OF TRUTH

When documents conflict:

1. MASTER.md
2. Specific domain document
3. Existing implementation
4. Agent assumptions

Never reverse this order.

However, MASTER.md should remain high-level.

Specific implementation details belong in their relevant document.

---

# 9. AGENT OPERATING MODE

An agent must work incrementally.

The agent must NOT attempt to generate the entire project in one uncontrolled operation.

Correct workflow:

READ
↓
UNDERSTAND
↓
INSPECT
↓
PLAN
↓
IMPLEMENT SMALL UNIT
↓
TEST
↓
REVIEW
↓
DOCUMENT
↓
COMMIT
↓
NEXT TASK

---

# 10. FIRST ACTION

Before writing code, the agent must:

1. inspect repository;
2. read AGENTS.md;
3. read MASTER.md;
4. read PRODUCT.md;
5. read MVP.md;
6. read ARCHITECTURE.md;
7. read TECH_STACK.md;
8. inspect current code;
9. determine current roadmap phase.

Do not start coding before understanding the current state.

---

# 11. TASK SELECTION

The agent should work according to ROADMAP.md.

Do not skip foundational work simply because a later feature is more visually interesting.

Correct order:

Foundation
→ Auth
→ Multi-tenancy
→ Database
→ Storage
→ Properties
→ AI
→ Results
→ Usage
→ Billing
→ Analytics
→ Security
→ Tests
→ Polish
→ Production

---

# 12. TASK SIZE

Every implementation task must have a narrow scope.

Good:

"Implement property creation."

Good:

"Create RLS policies for properties."

Good:

"Implement OpenAIAdapter."

Bad:

"Build the application."

Bad:

"Improve everything."

---

# 13. PLANNING

Before implementation, the agent should identify:

### Goal

What is being implemented?

### Files

Which files should change?

### Dependencies

What existing code is required?

### Acceptance criteria

How will we know it works?

### Tests

What must be tested?

---

# 14. IMPLEMENTATION

The agent must:

- modify the minimum required files;
- reuse existing abstractions;
- avoid duplicate logic;
- respect architecture;
- follow existing naming conventions;
- avoid unnecessary dependencies.

---

# 15. TESTING

After implementation:

Run relevant tests.

At minimum:

- lint;
- typecheck;
- relevant unit tests.

For critical flows:

- integration;
- E2E.

The agent must not declare success merely because the application compiles.

---

# 16. FAILURE RULE

If tests fail:

DO NOT continue blindly.

Determine:

- why they fail;
- whether implementation is wrong;
- whether test is wrong;
- whether architecture is affected.

Fix before continuing.

---

# 17. ARCHITECTURE CHANGE RULE

If the agent believes architecture must change:

STOP.

Explain:

1. current architecture;
2. problem;
3. why current architecture is insufficient;
4. proposed change;
5. alternatives;
6. consequences.

Do not silently modify architecture.

---

# 18. SECURITY RULE

Security boundaries are non-negotiable.

Never:

- bypass RLS;
- expose secrets;
- trust client authorization;
- expose private storage;
- call AI providers directly from client;
- trust arbitrary external image URLs.

---

# 19. MULTI-TENANCY RULE

Every organization must be isolated.

Example:

Organization A
cannot access
Organization B.

This must be enforced at database level.

---

# 20. AI RULE

The UI never knows provider implementation details.

Correct:

UI
→ GenerationService
→ ImageGenerationService
→ ProviderAdapter
→ Provider.

The provider may change.

The application should not need to change its domain logic.

---

# 21. BILLING RULE

The UI never determines whether a customer is entitled to generate.

The backend must determine entitlement.

Stripe determines subscription/payment state.

Our system determines:

- credits;
- usage;
- entitlement;
- provider cost.

---

# 22. DATA RULE

Original images must never be destroyed when generating staged versions.

Store:

original
+
generated

as separate assets.

---

# 23. GENERATION STATE MACHINE

Allowed states:

pending
processing
completed
failed
cancelled

Expected flow:

pending
→ processing
→ completed

or:

pending
→ processing
→ failed

or:

pending
→ cancelled

Retries are limited and must not corrupt state.

Job processing is idempotent and protected against duplicate claims.

Retries must never double-charge credits.

---

# 24. COST CONTROL

Every generation should be traceable.

We must know:

organization
→ generation
→ provider
→ estimated provider cost
→ credits consumed.

This is necessary to understand unit economics.

---

# 25. OBSERVABILITY

Track:

- signup;
- property creation;
- image upload;
- generation started;
- generation completed;
- generation failed;
- download;
- subscription started;
- subscription cancelled.

Errors:

Sentry.

Product analytics:

PostHog.

---

# 26. DEVELOPMENT ENVIRONMENTS

Development:

local.

Staging:

Vercel staging
+
Supabase staging
+
test Stripe.

Production:

Vercel production
+
Supabase production
+
live Stripe.

Never mix credentials.

---

# 27. GIT

Use:

feature branch
→ PR
→ CI
→ review
→ merge.

Avoid huge commits.

Avoid huge PRs.

---

# 28. DEFINITION OF MVP COMPLETE

The MVP is complete when:

### Authentication

Users can register and login.

### Organization

Users belong to an organization.

An organization is created automatically on signup.

The first user of an organization is the owner.

### Security

RLS prevents cross-organization access.

### Properties

Users can create properties.

### Rooms

Users can upload photographs.

### Styles

Users can select supported styles.

### AI

Users can generate staging.

### Results

Users can see generated images.

### Comparison

Users can compare original and generated image.

### Regeneration

Users can generate another result.

### Download

Users can download the result.

### Usage

Generations are recorded.

Each organization receives 3 free generations (no card required).

Credit control and decrement happen exclusively in the backend.

Credit consumption is transactional:

- credits_available / credits_reserved;
- the credit is reserved at job creation;
- consumed when the generation completes;
- refunded on provider error;
- refunded if the user cancels before processing;
- retries never double-charge.

When free credits are exhausted, new generations are blocked and the payment conversion flow is shown.

### Billing

Subscriptions are handled by Stripe.

### Monitoring

Errors are captured.

### Analytics

Core product events are tracked.

### Deployment

Application runs in production.

### Testing

Critical tests pass.

---

# 29. WHAT NOT TO BUILD

Do not build:

- microservices;
- Kubernetes;
- GraphQL;
- tRPC;
- complex queues;
- Redis;
- BullMQ;
- Kafka;
- custom billing;
- custom authentication;
- custom object storage;
- plugin architecture;
- enterprise permissions;
- complex multi-org support;
- unnecessary abstraction layers.

Unless a future requirement proves that one is necessary.

---

# 30. WHAT TO BUILD FOR THE FUTURE

The architecture should allow:

- additional AI providers;
- better workers;
- external queues;
- larger storage;
- more plans;
- more sophisticated usage;
- additional product modules.

But these should be implemented only when justified by real demand or scale.

---

# 31. 7-DAY DEVELOPMENT TARGET

Day 1:

Foundation.

Day 2:

Auth + multi-tenancy.

Day 3:

Database + storage + properties.

Day 4:

AI engine.

Day 5:

Results.

Day 6:

Usage + billing.

Day 7:

Testing + monitoring + polish + production.

This is a target, not a reason to sacrifice correctness.

If a critical architectural or security issue requires additional time:

correctness wins.

---

# 32. COMMERCIAL VALIDATION

After deployment:

Recruit approximately 5–10 small real-estate agencies.

Measure:

- activation;
- properties created;
- generations;
- repeat usage;
- downloads;
- retention;
- conversion to paid.

The strongest validation signal is:

> the customer continues using the product and pays after the pilot.

---

# 33. POST-MVP RULE

Do not automatically build features because customers mention them.

Prioritize features based on:

1. frequency of request;
2. revenue impact;
3. retention impact;
4. development cost;
5. strategic fit.

---

# 34. PRODUCT PRINCIPLE

The product should make a complex technical process feel simple.

The customer should think:

"Subo la foto y obtengo una vivienda preparada para vender."

They should NOT think about:

- models;
- APIs;
- workers;
- prompts;
- tokens;
- providers;
- databases.

---

# 35. ENGINEERING PRINCIPLE

The code should make the product easy to change.

Not easy to over-engineer.

Prefer:

simple
+
modular
+
tested
+
secure

over:

complex
+
abstract
+
distributed
+
prematurely scalable.

---

# 36. AGENT PRINCIPLE

The agent is an implementation worker.

The agent is NOT the product owner.

The agent must not independently decide:

- new features;
- new business models;
- new architecture;
- new providers;
- major stack changes.

The agent executes the project specification.

---

# 37. HUMAN ROLE

Human decisions are required for:

- product scope;
- pricing;
- architecture changes;
- AI provider changes;
- security changes;
- production infrastructure;
- commercial strategy.

The agent can recommend.

The agent cannot silently decide.

---

# 38. FINAL COMMAND

When beginning a new development session:

READ THE DOCUMENTATION.

INSPECT THE CURRENT STATE.

IDENTIFY THE NEXT ROADMAP TASK.

PLAN THE SMALLEST VALID IMPLEMENTATION.

IMPLEMENT IT.

TEST IT.

REVIEW IT.

DOCUMENT IT.

COMMIT IT.

THEN CONTINUE.

Never trade architectural integrity for speed.

Never trade security for convenience.

Never add complexity without a reason.

Build the MVP.

Validate the market.

Then evolve the system based on reality.
