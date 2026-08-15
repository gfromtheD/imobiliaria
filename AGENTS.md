# AGENTS.md

## PROJECT

This repository contains a SaaS web application for AI-powered virtual staging for small real-estate agencies.

The product allows a real-estate agency to:

1. Create a property.
2. Upload an empty-room image.
3. Select room type.
4. Select interior style.
5. Generate a virtually staged image.
6. Review the result.
7. Regenerate.
8. Download the result.

---

# 1. READ FIRST

Before changing code, read:

1. AGENTS.md
2. docs/PRODUCT.md
3. docs/MVP.md
4. docs/ARCHITECTURE.md
5. docs/TECH_STACK.md

Then read the specific document relevant to the task.

Examples:

AI task:
→ docs/AI.md

Database task:
→ docs/DATABASE.md

Billing task:
→ docs/BILLING.md

Security task:
→ docs/SECURITY.md

Development task:
→ docs/DEVELOPMENT.md

---

# 2. NON-NEGOTIABLE RULES

Do not:

- redefine product scope;
- introduce new architecture without approval;
- introduce unnecessary dependencies;
- expose secrets;
- call AI providers directly from client components;
- bypass RLS;
- put business logic inside UI components;
- create unnecessary abstractions;
- create microservices;
- create a separate backend;
- introduce GraphQL without explicit approval;
- introduce tRPC without explicit approval;
- create a monorepo;
- create an external queue for the MVP (no Redis, no BullMQ);
- rewrite working code unnecessarily.

---

# 3. STACK

Official stack:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Edge Functions (AI worker)
- Vercel
- Vercel Cron (job trigger/retry)
- Stripe
- Sentry
- PostHog
- Vercel Analytics
- Vitest
- Playwright
- GitHub Actions

AI:

Initial provider:
OpenAI Images API (GPT Image 2)

Future alternative:
FLUX

---

# 4. ARCHITECTURE

Use:

/app
/components
/features
/lib
/services
/providers
/tests
/docs

Keep responsibilities separated.

---

# 5. UI RULE

UI components should not contain complex business logic.

Do not put:

- billing rules;
- credit calculations;
- provider calls;
- authorization rules;
- generation state machines;

inside React components.

---

# 6. AI RULE

Never call AI provider SDKs directly from UI.

Correct:

UI
→ API/server action
→ GenerationService
→ ImageGenerationService
→ ProviderAdapter
→ AI provider

Incorrect:

React component
→ OpenAI

React component
→ any AI provider SDK

---

# 7. BILLING RULE

Never implement billing logic in UI.

Stripe is the source of truth for payments/subscriptions.

Our database tracks:

- entitlement;
- usage;
- credits;
- provider cost.

---

# 8. DATABASE RULE

Use RLS.

Every multi-tenant operation must be protected.

Never assume a frontend filter provides security.

---

# 9. MULTI-TENANCY

The application is multi-tenant.

A tenant is an organization.

Never allow:

Organization A
→ access Organization B data.

---

# 10. GENERATION STATES

Generation states:

pending
processing
succeeded
failed

Do not introduce arbitrary state names.

---

# 11. TASK SIZE

Tasks must be narrow.

Good:

"Implement property creation."

Good:

"Add RLS policy for properties."

Good:

"Implement OpenAIAdapter."

Bad:

"Build the entire SaaS."

---

# 12. BEFORE CODING

Before modifying files:

1. inspect repository;
2. identify existing implementation;
3. read relevant docs;
4. state intended changes;
5. implement minimum necessary change.

---

# 13. AFTER CODING

Run:

- lint;
- typecheck;
- relevant unit tests;
- relevant integration tests;
- E2E when relevant.

Do not continue while relevant tests are failing.

---

# 14. DO NOT REWRITE

If an existing implementation works:

do not rewrite it merely because another approach looks cleaner.

Prefer incremental improvements.

---

# 15. DEPENDENCIES

Before adding a dependency ask:

1. Is it necessary?
2. Can existing stack solve it?
3. Does it introduce architectural complexity?
4. Is it maintained?
5. Is it justified by the MVP?

If not clearly justified:

do not add it.

---

# 16. SECRETS

Never commit:

- API keys;
- passwords;
- Stripe secrets;
- Supabase service role key;
- environment secrets.

Use environment variables.

---

# 17. DOCUMENTATION

If a change modifies architecture:

update the relevant document.

If it changes:

- database → DATABASE.md
- AI → AI.md
- billing → BILLING.md
- security → SECURITY.md
- architecture → ARCHITECTURE.md

---

# 18. HUMAN CHECKPOINTS

Request human review before:

- changing database architecture;
- changing RLS;
- changing billing;
- changing AI provider architecture;
- adding infrastructure;
- introducing new external services;
- changing authentication;
- changing production deployment.

---

# 19. DEFINITION OF DONE

A task is complete only when:

- implementation exists;
- tests pass;
- lint passes;
- typecheck passes;
- security rules are respected;
- architecture remains consistent;
- documentation is updated if necessary.

---

# 20. PRIORITY

When requirements conflict, prioritize:

1. Security
2. Data integrity
3. Product requirements
4. Architectural consistency
5. Simplicity
6. Performance
7. Convenience

---

# 21. CORE PRINCIPLE

Do not optimize for writing the most code.

Optimize for:

> the smallest correct change that moves the product forward without damaging the architecture.
