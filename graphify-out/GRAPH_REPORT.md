# Graph Report - imobiliaria  (2026-08-31)

## Corpus Check
- 104 files · ~52,142 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 975 nodes · 1310 edges · 64 communities (56 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `41552dd4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- forgot-password-form.tsx
- properties.ts
- createClient
- compilerOptions
- generations-section.tsx
- room-upload-form.tsx
- process-generation/index.ts
- devDependencies
- dependencies
- 20260815010000_product_foundation.sql
- database.ts
- components.json
- settings/page.tsx
- phase1_foundation.ps1
- page-skeleton.tsx
- 20260815030000_rpc_null_and_scheduler_fixes.sql
- phase0_validation.ps1
- 20260815000000_phase0_pipeline.sql
- app/layout.tsx
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- ROADMAP.md
- MASTER.md
- AI.md
- DATABASE.md
- Virtual Staging SaaS
- ARCHITECTURE.md
- 2. Funcionalidades obligatorias
- TECH_STACK.md
- SECURITY.md
- What You Must Do When Invoked
- AGENTS.md
- DEVELOPMENT.md
- cn
- BILLING.md
- PRODUCT.md
- PROJECT_AUDIT.md
- 28. DEFINITION OF MVP COMPLETE
- PHASE 0 VALIDATION — Pipeline Asíncrono
- TECHNICAL_DECISIONS.md
- 7. DOCUMENT HIERARCHY
- generations.ts
- Graphify
- proxy.ts
- graphify reference: extra exports and benchmark
- handleSubmit
- getProperty
- properties/page.tsx
- 13. PLANNING
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- 4. MVP SCOPE
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- VIRTUAL STAGING SAAS
- extraction-spec.md

## God Nodes (most connected - your core abstractions)
1. `cn()` - 40 edges
2. `createClient()` - 30 edges
3. `28. DEFINITION OF MVP COMPLETE` - 18 edges
4. `Button()` - 17 edges
5. `Virtual Staging SaaS` - 17 edges
6. `compilerOptions` - 16 edges
7. `PHASE 0 VALIDATION — Pipeline Asíncrono` - 15 edges
8. `7. DOCUMENT HIERARCHY` - 14 edges
9. `2. Funcionalidades obligatorias` - 14 edges
10. `8. Pipeline` - 13 edges

## Surprising Connections (you probably didn't know these)
- `EditPropertyPage()` --calls--> `getProperty()`  [EXTRACTED]
  app/(app)/properties/[propertyId]/edit/page.tsx → services/properties.ts
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `CardFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `SelectGroup()` --calls--> `cn()`  [EXTRACTED]
  components/ui/select.tsx → lib/utils.ts
- `SelectLabel()` --calls--> `cn()`  [EXTRACTED]
  components/ui/select.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (64 total, 8 thin omitted)

### Community 0 - "forgot-password-form.tsx"
Cohesion: 0.14
Nodes (15): metadata, metadata, metadata, ForgotPasswordForm(), initialState, initialState, LoginForm(), initialState (+7 more)

### Community 1 - "properties.ts"
Cohesion: 0.21
Nodes (9): metadata, EditPropertyPage(), metadata, initialState, PropertyForm(), createPropertyAction(), PropertyFormState, PropertyRow (+1 more)

### Community 2 - "createClient"
Cohesion: 0.24
Nodes (14): metadata, RoomDetailPage(), HomePage(), RoomType, createClient(), getStagedImageUrl(), getSubscription(), listGenerations() (+6 more)

### Community 3 - "compilerOptions"
Cohesion: 0.07
Nodes (29): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+21 more)

### Community 4 - "generations-section.tsx"
Cohesion: 0.12
Nodes (22): metadata, metadata, AuthCard(), GenerationForm(), GenerationViewItem, DeletePropertyButton(), Badge(), badgeVariants (+14 more)

### Community 5 - "room-upload-form.tsx"
Cohesion: 0.10
Nodes (26): initialState, RoomCard(), initialState, Select(), SelectContent(), SelectGroup(), SelectItem(), SelectLabel() (+18 more)

### Community 6 - "process-generation/index.ts"
Cohesion: 0.11
Nodes (19): asRow(), authHeaders(), callRpc(), getRow(), mock, Row, mock, RpcArgs (+11 more)

### Community 7 - "devDependencies"
Cohesion: 0.07
Nodes (27): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+19 more)

### Community 8 - "dependencies"
Cohesion: 0.07
Nodes (27): class-variance-authority, clsx, lucide-react, next, dependencies, class-variance-authority, clsx, lucide-react (+19 more)

### Community 9 - "20260815010000_product_foundation.sql"
Cohesion: 0.12
Nodes (11): auth.users, public.app_config, public.current_org_id(), public.generations, public.organizations, public.properties, public.rooms, public.styles (+3 more)

### Community 10 - "database.ts"
Cohesion: 0.17
Nodes (11): createClient(), CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json (+3 more)

### Community 11 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 12 - "settings/page.tsx"
Cohesion: 0.22
Nodes (11): AppLayout(), metadata, SettingsPage(), AppSidebar(), SidebarNavLink(), SignOutButton(), SUBSCRIPTION_PLAN_LABELS, signOutAction() (+3 more)

### Community 13 - "phase1_foundation.ps1"
Cohesion: 0.26
Nodes (10): Assert(), AssertEq(), AssertNullRow(), AssertOk(), Get-Table(), Invoke-Api(), Invoke-Rpc(), Post-Table() (+2 more)

### Community 15 - "20260815030000_rpc_null_and_scheduler_fixes.sql"
Cohesion: 0.22
Nodes (8): public.app_config, public.generations, public.subscriptions, recovered, public.complete_generation(), public.fail_generation(), public.process_generation_jobs(), public.retry_generation()

### Community 16 - "phase0_validation.ps1"
Cohesion: 0.31
Nodes (8): Check(), Fail(), GetJobState(), InsertJob(), Pass(), Say(), Sql(), WaitFor()

### Community 17 - "20260815000000_phase0_pipeline.sql"
Cohesion: 0.32
Nodes (3): public.image_jobs, public.phase0_config, public.process_jobs()

### Community 18 - "app/layout.tsx"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 27 - "ROADMAP.md"
Cohesion: 0.05
Nodes (42): 7-DAY TARGET, Día 1, Día 2, Día 3, Día 4, Día 5, Día 6, Día 7 (+34 more)

### Community 28 - "MASTER.md"
Cohesion: 0.05
Nodes (35): 0. PURPOSE, 10. FIRST ACTION, 11. TASK SELECTION, 12. TASK SIZE, 14. IMPLEMENTATION, 15. TESTING, 16. FAILURE RULE, 17. ARCHITECTURE CHANGE RULE (+27 more)

### Community 29 - "AI.md"
Cohesion: 0.06
Nodes (34): 10. Créditos, 11. Prompts, 12. Input, 13. Arquitectura visual, 14. Original vs generated, 15. Asincronía, 16. Polling / Realtime, 17. Rate limiting (+26 more)

### Community 30 - "DATABASE.md"
Cohesion: 0.06
Nodes (29): 10. Índices iniciales, 11. Migraciones, 12. Datos sensibles, 13. Eliminación, 14. Regla, 1. Base de datos, 2. Entidades principales, 3. Relaciones (+21 more)

### Community 31 - "Virtual Staging SaaS"
Cohesion: 0.07
Nodes (26): AI, AI flow, Analytics, Architecture, Backend, CI/CD, Core product, Development principles (+18 more)

### Community 32 - "ARCHITECTURE.md"
Cohesion: 0.08
Nodes (24): 10. Provider abstraction, 11. Regla de arquitectura, 12. Escalabilidad futura, 13. Seguridad, 14. Principio de cambio, 1. Objetivo, 2. Principio principal, 3. Arquitectura general (+16 more)

### Community 33 - "2. Funcionalidades obligatorias"
Cohesion: 0.08
Nodes (24): 1. Objetivo, 2.10 Regeneración, 2.11 Descarga, 2.12 Uso, 2.13 Créditos gratuitos, 2.1 Autenticación, 2.2 Organización, 2.3 Propiedades (+16 more)

### Community 34 - "TECH_STACK.md"
Cohesion: 0.08
Nodes (24): AI, Authentication, Backend, CI/CD, Components, Database, Dependencias, Environment variables (+16 more)

### Community 35 - "SECURITY.md"
Cohesion: 0.08
Nodes (23): 10. Abuse protection, 11. Stripe, 12. AI, 13. Logging, 14. GDPR, 15. Data deletion, 16. Error messages, 17. Dependencies (+15 more)

### Community 36 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 37 - "AGENTS.md"
Cohesion: 0.08
Nodes (22): 10. GENERATION STATES, 11. TASK SIZE, 12. BEFORE CODING, 13. AFTER CODING, 14. DO NOT REWRITE, 15. DEPENDENCIES, 16. SECRETS, 17. DOCUMENTATION (+14 more)

### Community 38 - "DEVELOPMENT.md"
Cohesion: 0.08
Nodes (22): 10. Tests, 11. Definition of Done, 12. Cambios de arquitectura, 13. Deployment, 14. Rollback, 15. Local development, 16. Regla, 1. Objetivo (+14 more)

### Community 39 - "cn"
Cohesion: 0.21
Nodes (15): initialState, AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader() (+7 more)

### Community 40 - "BILLING.md"
Cohesion: 0.10
Nodes (18): 10. Webhooks, 11. Estado de suscripción, 12. Billing y generación, 13. Pricing inicial, 14. Coste interno, 15. No hacer, 16. Regla, 1. Objetivo (+10 more)

### Community 41 - "PRODUCT.md"
Cohesion: 0.11
Nodes (17): 10. Métrica fundamental, 11. Validación comercial, 12. Principios de UX, 13. Principios de negocio, 14. Futuro, 15. Regla fundamental, 1. Propósito del producto, 2. Cliente objetivo (+9 more)

### Community 42 - "PROJECT_AUDIT.md"
Cohesion: 0.11
Nodes (16): 10. Preguntas que necesitan respuesta humana, 11. Checklist de condiciones para comenzar el desarrollo, 1. Resumen de lo que se ha entendido, 2. Arquitectura entendida, 3. Flujo del producto entendido, 4. Documentos revisados, 5. Decisiones cerradas, 6. Decisiones todavía abiertas (+8 more)

### Community 43 - "28. DEFINITION OF MVP COMPLETE"
Cohesion: 0.11
Nodes (18): 28. DEFINITION OF MVP COMPLETE, AI, Analytics, Authentication, Billing, Comparison, Deployment, Download (+10 more)

### Community 44 - "PHASE 0 VALIDATION — Pipeline Asíncrono"
Cohesion: 0.12
Nodes (15): 10. Limitaciones de la prueba, 11. Conclusión, 12. Estado de las condiciones (Fase 1, 2026-08-15), 13. Service role del worker en producción (2026-08-16), 14. Endurecimiento de la policy users (2026-08-16), 1. Objetivo, 2. Alcance y exclusiones, 3. Arquitectura validada (+7 more)

### Community 45 - "TECHNICAL_DECISIONS.md"
Cohesion: 0.14
Nodes (12): 10. Decisiones abiertas adicionales, 11. Regla, 1. Procesamiento asíncrono, 2. Storage, 3. Multi-tenancy, 4. Créditos, 5. Rate limiting, 6. IA (+4 more)

### Community 46 - "7. DOCUMENT HIERARCHY"
Cohesion: 0.14
Nodes (14): 7. DOCUMENT HIERARCHY, AGENTS.md, AI.md, ARCHITECTURE.md, BILLING.md, DATABASE.md, DEVELOPMENT.md, MVP.md (+6 more)

### Community 47 - "generations.ts"
Cohesion: 0.20
Nodes (10): GenerationsSection(), handleCancel(), statusVariant(), cancelGenerationAction(), createGenerationAction(), CreateGenerationResult, CreateGenerationState, GenerationListItem (+2 more)

### Community 48 - "Graphify"
Cohesion: 0.18
Nodes (10): 1. Qué es, 2. Rol en el proyecto, 3. Skill de proyecto, 4. Artefactos versionados, 5. Cómo reconstruir el grafo, 6. Cómo consultar el grafo, 7. Sin API keys, 8. Limitaciones (+2 more)

### Community 49 - "proxy.ts"
Cohesion: 0.33
Nodes (7): APP_ROUTE_PREFIXES, AUTH_ROUTES, isAppRoute(), isAuthRoute(), updateSession(), config, proxy()

### Community 50 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 51 - "handleSubmit"
Cohesion: 0.32
Nodes (7): RoomUploadForm(), handleSubmit(), validateFile(), sanitizeFileName(), createRoomAction(), finalizeRoomUploadAction(), mapRoomRpcError()

### Community 52 - "getProperty"
Cohesion: 0.38
Nodes (6): PropertyDetailPage(), metadata, NewRoomPage(), RoomsPage(), getProperty(), listRooms()

### Community 53 - "properties/page.tsx"
Cohesion: 0.47
Nodes (4): metadata, PropertiesPage(), PropertyCard(), listProperties()

### Community 54 - "13. PLANNING"
Cohesion: 0.33
Nodes (6): 13. PLANNING, Acceptance criteria, Dependencies, Files, Goal, Tests

### Community 55 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 56 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 57 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 58 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 59 - "4. MVP SCOPE"
Cohesion: 0.67
Nodes (3): 4. MVP SCOPE, EXCLUDED, INCLUDED

## Knowledge Gaps
- **567 isolated node(s):** `metadata`, `metadata`, `metadata`, `metadata`, `metadata` (+562 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `forgot-password-form.tsx`, `generations-section.tsx`, `room-upload-form.tsx`, `page-skeleton.tsx`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `createClient()` connect `createClient` to `forgot-password-form.tsx`, `properties.ts`, `cn`, `settings/page.tsx`, `generations.ts`, `handleSubmit`, `getProperty`, `properties/page.tsx`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `Button()` connect `generations-section.tsx` to `forgot-password-form.tsx`, `properties.ts`, `room-upload-form.tsx`, `cn`, `settings/page.tsx`, `properties/page.tsx`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `metadata`, `metadata`, `metadata` to the rest of the system?**
  _567 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `forgot-password-form.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13675213675213677 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `generations-section.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._