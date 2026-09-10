# Graph Report - imobiliaria  (2026-09-10)

## Corpus Check
- 134 files · ~62,622 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1122 nodes · 1662 edges · 75 communities (56 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e2e03d07`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- domain.ts
- properties.ts
- MASTER.md
- AI.md
- DATABASE.md
- compilerOptions
- mock_adapter.ts
- ROADMAP.md
- Virtual Staging SaaS
- ARCHITECTURE.md
- 2. Funcionalidades obligatorias
- TECH_STACK.md
- What You Must Do When Invoked
- 20260815010000_product_foundation.sql
- SECURITY.md
- AGENTS.md
- DEVELOPMENT.md
- components.json
- package.json
- BILLING.md
- resend.ts
- PRODUCT.md
- 28. DEFINITION OF MVP COMPLETE
- PROJECT_AUDIT.md
- generation_instructions.ts
- PHASE 0 VALIDATION — Pipeline Asíncrono
- dependencies
- 20260815030000_rpc_null_and_scheduler_fixes.sql
- page-skeleton.tsx
- 7. DOCUMENT HIERARCHY
- TECHNICAL_DECISIONS.md
- phase1_foundation.ps1
- Graphify
- phase0_validation.ps1
- proxy.ts
- graphify reference: extra exports and benchmark
- process-generation/index.ts
- createClient
- 20260815000000_phase0_pipeline.sql
- cloud_e2e.ps1
- stripe_webhook_e2e.ps1
- 13. PLANNING
- graphify reference: query, path, explain
- database.ts
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- 4. MVP SCOPE
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- vercel.json
- eslint.config.mjs
- VIRTUAL STAGING SAAS
- generations.ts
- extraction-spec.md
- postcss.config.mjs
- public.phase0_config
- (app)/layout.tsx
- rooms.ts
- generation_provider.ts
- ALPHA_SETUP_GUIDE.md
- Guía de Despliegue, Staging y Configuración de Dominio
- Benchmark manual de proveedores de imagen
- process-job/index.ts
- 20260815040000_stripe_billing.sql
- GenerationsSection
- ProviderAdapter
- public.app_config

## God Nodes (most connected - your core abstractions)
1. `cn()` - 40 edges
2. `createClient()` - 38 edges
3. `Button()` - 21 edges
4. `react` - 21 edges
5. `28. DEFINITION OF MVP COMPLETE` - 18 edges
6. `Virtual Staging SaaS` - 17 edges
7. `compilerOptions` - 16 edges
8. `next` - 15 edges
9. `PHASE 0 VALIDATION — Pipeline Asíncrono` - 15 edges
10. `7. DOCUMENT HIERARCHY` - 14 edges

## Surprising Connections (you probably didn't know these)
- `GenerationsPage()` --calls--> `listAllGenerations()`  [EXTRACTED]
  app/(app)/generations/page.tsx → services/generations.ts
- `EditPropertyPage()` --calls--> `getProperty()`  [EXTRACTED]
  app/(app)/properties/[propertyId]/edit/page.tsx → services/properties.ts
- `NewRoomPage()` --calls--> `getProperty()`  [EXTRACTED]
  app/(app)/properties/[propertyId]/rooms/new/page.tsx → services/properties.ts
- `POST()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/api/webhooks/stripe/route.ts → lib/supabase/admin.ts
- `GET()` --calls--> `createClient()`  [EXTRACTED]
  app/auth/callback/route.ts → lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (75 total, 13 thin omitted)

### Community 0 - "cn"
Cohesion: 0.05
Nodes (76): metadata, metadata, metadata, metadata, AuthCard(), ForgotPasswordForm(), initialState, initialState (+68 more)

### Community 1 - "domain.ts"
Cohesion: 0.14
Nodes (13): ALLOWED_IMAGE_MIME, GENERATION_STATUS_DESCRIPTIONS, GENERATION_STATUSES, MAX_IMAGE_BYTES, MAX_ROOMS_PER_PROPERTY, PROPERTY_STATUSES, PropertyStatus, ROOM_TYPE_DESCRIPTIONS (+5 more)

### Community 2 - "properties.ts"
Cohesion: 0.07
Nodes (30): metadata, metadata, PropertiesPage(), EditPropertyPage(), metadata, PropertyDetailPage(), metadata, NewRoomPage() (+22 more)

### Community 3 - "MASTER.md"
Cohesion: 0.05
Nodes (35): 0. PURPOSE, 10. FIRST ACTION, 11. TASK SELECTION, 12. TASK SIZE, 14. IMPLEMENTATION, 15. TESTING, 16. FAILURE RULE, 17. ARCHITECTURE CHANGE RULE (+27 more)

### Community 4 - "AI.md"
Cohesion: 0.05
Nodes (35): 10. Créditos, 11. Prompts, 12. Input, 13. Arquitectura visual, 14. Original vs generated, 15. Asincronía, 16. Polling / Realtime, 17. Rate limiting (+27 more)

### Community 5 - "DATABASE.md"
Cohesion: 0.06
Nodes (29): 10. Índices iniciales, 11. Migraciones, 12. Datos sensibles, 13. Eliminación, 14. Regla, 1. Base de datos, 2. Entidades principales, 3. Relaciones (+21 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 7 - "mock_adapter.ts"
Cohesion: 0.25
Nodes (11): GenerationInput, GenerationSubmission, chunk(), crc32(), CRC_TABLE, fnv1a(), MockAdapter, MockImageArtifact (+3 more)

### Community 8 - "ROADMAP.md"
Cohesion: 0.05
Nodes (42): 7-DAY TARGET, Día 1, Día 2, Día 3, Día 4, Día 5, Día 6, Día 7 (+34 more)

### Community 9 - "Virtual Staging SaaS"
Cohesion: 0.07
Nodes (26): AI, AI flow, Analytics, Architecture, Backend, CI/CD, Core product, Development principles (+18 more)

### Community 10 - "ARCHITECTURE.md"
Cohesion: 0.08
Nodes (24): 10. Provider abstraction, 11. Regla de arquitectura, 12. Escalabilidad futura, 13. Seguridad, 14. Principio de cambio, 1. Objetivo, 2. Principio principal, 3. Arquitectura general (+16 more)

### Community 11 - "2. Funcionalidades obligatorias"
Cohesion: 0.08
Nodes (24): 1. Objetivo, 2.10 Regeneración, 2.11 Descarga, 2.12 Uso, 2.13 Créditos gratuitos, 2.1 Autenticación, 2.2 Organización, 2.3 Propiedades (+16 more)

### Community 12 - "TECH_STACK.md"
Cohesion: 0.08
Nodes (24): AI, Authentication, Backend, CI/CD, Components, Database, Dependencias, Environment variables (+16 more)

### Community 13 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 14 - "20260815010000_product_foundation.sql"
Cohesion: 0.12
Nodes (11): auth.users, public.app_config, public.current_org_id(), public.generations, public.organizations, public.properties, public.rooms, public.styles (+3 more)

### Community 15 - "SECURITY.md"
Cohesion: 0.08
Nodes (23): 10. Abuse protection, 11. Stripe, 12. AI, 13. Logging, 14. GDPR, 15. Data deletion, 16. Error messages, 17. Dependencies (+15 more)

### Community 16 - "AGENTS.md"
Cohesion: 0.08
Nodes (23): 10. GENERATION STATES, 11. TASK SIZE, 12. BEFORE CODING, 13. AFTER CODING, 14. DO NOT REWRITE, 15. DEPENDENCIES, 16. SECRETS, 17. DOCUMENTATION (+15 more)

### Community 17 - "DEVELOPMENT.md"
Cohesion: 0.08
Nodes (22): 10. Tests, 11. Definition of Done, 12. Cambios de arquitectura, 13. Deployment, 14. Rollback, 15. Local development, 16. Regla, 1. Objetivo (+14 more)

### Community 18 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 19 - "package.json"
Cohesion: 0.05
Nodes (47): POST(), BillingSection(), CREDIT_PACKAGES, getCreditPackage(), stripe, createAdminClient(), devDependencies, eslint (+39 more)

### Community 20 - "BILLING.md"
Cohesion: 0.10
Nodes (18): 10. Webhooks, 11. Estado de suscripción, 12. Billing y generación, 13. Pricing inicial, 14. Coste interno, 15. No hacer, 16. Regla, 1. Objetivo (+10 more)

### Community 21 - "resend.ts"
Cohesion: 0.23
Nodes (9): getEmailProvider(), MockEmailProvider, ResendEmailProvider, EmailPayload, EmailProvider, EmailResult, logger, LogLevel (+1 more)

### Community 22 - "PRODUCT.md"
Cohesion: 0.11
Nodes (17): 10. Métrica fundamental, 11. Validación comercial, 12. Principios de UX, 13. Principios de negocio, 14. Futuro, 15. Regla fundamental, 1. Propósito del producto, 2. Cliente objetivo (+9 more)

### Community 23 - "28. DEFINITION OF MVP COMPLETE"
Cohesion: 0.11
Nodes (18): 28. DEFINITION OF MVP COMPLETE, AI, Analytics, Authentication, Billing, Comparison, Deployment, Download (+10 more)

### Community 24 - "PROJECT_AUDIT.md"
Cohesion: 0.11
Nodes (16): 10. Preguntas que necesitan respuesta humana, 11. Checklist de condiciones para comenzar el desarrollo, 1. Resumen de lo que se ha entendido, 2. Arquitectura entendida, 3. Flujo del producto entendido, 4. Documentos revisados, 5. Decisiones cerradas, 6. Decisiones todavía abiertas (+8 more)

### Community 25 - "generation_instructions.ts"
Cohesion: 0.14
Nodes (13): FIDELITY_POLICY, PresetDefinition, PRESETS, PROMPT_VERSION, resolveGenerationInstructions(), FidelityPolicy, input(), createManualBenchmarkPackage() (+5 more)

### Community 26 - "PHASE 0 VALIDATION — Pipeline Asíncrono"
Cohesion: 0.12
Nodes (15): 10. Limitaciones de la prueba, 11. Conclusión, 12. Estado de las condiciones (Fase 1, 2026-08-15), 13. Service role del worker en producción (2026-08-16), 14. Endurecimiento de la policy users (2026-08-16), 1. Objetivo, 2. Alcance y exclusiones, 3. Arquitectura validada (+7 more)

### Community 27 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, class-variance-authority, clsx, lucide-react, next, radix-ui, react, react-dom (+8 more)

### Community 28 - "20260815030000_rpc_null_and_scheduler_fixes.sql"
Cohesion: 0.22
Nodes (8): public.generations, recovered, public.complete_generation(), public.fail_generation(), public.process_generation_jobs(), public.retry_generation(), public.app_config, public.subscriptions

### Community 30 - "7. DOCUMENT HIERARCHY"
Cohesion: 0.14
Nodes (14): 7. DOCUMENT HIERARCHY, AGENTS.md, AI.md, ARCHITECTURE.md, BILLING.md, DATABASE.md, DEVELOPMENT.md, MVP.md (+6 more)

### Community 31 - "TECHNICAL_DECISIONS.md"
Cohesion: 0.14
Nodes (12): 10. Decisiones abiertas adicionales, 11. Regla, 1. Procesamiento asíncrono, 2. Storage, 3. Multi-tenancy, 4. Créditos, 5. Rate limiting, 6. IA (+4 more)

### Community 32 - "phase1_foundation.ps1"
Cohesion: 0.26
Nodes (10): Assert(), AssertEq(), AssertNullRow(), AssertOk(), Get-Table(), Invoke-Api(), Invoke-Rpc(), Post-Table() (+2 more)

### Community 33 - "Graphify"
Cohesion: 0.18
Nodes (10): 1. Qué es, 2. Rol en el proyecto, 3. Skill de proyecto, 4. Artefactos versionados, 5. Cómo reconstruir el grafo, 6. Cómo consultar el grafo, 7. Sin API keys, 8. Limitaciones (+2 more)

### Community 34 - "phase0_validation.ps1"
Cohesion: 0.31
Nodes (8): Check(), Fail(), GetJobState(), InsertJob(), Pass(), Say(), Sql(), WaitFor()

### Community 35 - "proxy.ts"
Cohesion: 0.33
Nodes (7): APP_ROUTE_PREFIXES, AUTH_ROUTES, isAppRoute(), isAuthRoute(), updateSession(), config, proxy()

### Community 36 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 37 - "process-generation/index.ts"
Cohesion: 0.18
Nodes (10): asRow(), authHeaders(), callRpc(), downloadOriginalImage(), getRow(), provider, Row, ImageArtifact (+2 more)

### Community 38 - "createClient"
Cohesion: 0.30
Nodes (11): metadata, RoomDetailPage(), GET(), HomePage(), createClient(), getStagedImageUrl(), getSubscription(), listGenerations() (+3 more)

### Community 39 - "20260815000000_phase0_pipeline.sql"
Cohesion: 0.32
Nodes (3): public.image_jobs, public.phase0_config, public.process_jobs()

### Community 40 - "cloud_e2e.ps1"
Cohesion: 0.43
Nodes (4): Get-FirstRow(), Invoke-Api(), Invoke-Rpc(), Wait-ForGeneration()

### Community 42 - "13. PLANNING"
Cohesion: 0.33
Nodes (6): 13. PLANNING, Acceptance criteria, Dependencies, Files, Goal, Tests

### Community 43 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 44 - "database.ts"
Cohesion: 0.18
Nodes (11): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+3 more)

### Community 45 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 46 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 47 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 48 - "4. MVP SCOPE"
Cohesion: 0.67
Nodes (3): 4. MVP SCOPE, EXCLUDED, INCLUDED

### Community 56 - "generations.ts"
Cohesion: 0.21
Nodes (11): GenerationsPage(), metadata, GenerationForm(), AllGenerationsItem, createGenerationAction(), CreateGenerationResult, GenerationListItem, getOriginalImageUrlByPath() (+3 more)

### Community 64 - "(app)/layout.tsx"
Cohesion: 0.26
Nodes (9): AppLayout(), SettingsPage(), AppSidebar(), SidebarNavLink(), SUBSCRIPTION_PLAN_LABELS, getBillingData(), CurrentOrganization, getCurrentOrganization() (+1 more)

### Community 65 - "rooms.ts"
Cohesion: 0.22
Nodes (11): RoomUploadForm(), handleSubmit(), validateFile(), RoomType, sanitizeFileName(), createClient(), createRoomAction(), CreateRoomResult (+3 more)

### Community 66 - "generation_provider.ts"
Cohesion: 0.23
Nodes (10): CompletedGeneration, GENERATION_PROVIDER_CONTRACT_VERSION, GenerationPollInput, GenerationPollResult, GenerationResult, OriginalImageAccess, OriginalImageReference, ResolvedGenerationInstructions (+2 more)

### Community 67 - "ALPHA_SETUP_GUIDE.md"
Cohesion: 0.17
Nodes (10): 1. Despliegue Gratuito en Vercel (`*.vercel.app`), 2. Configuración de Supabase para Vercel (`*.vercel.app`), 3. Stripe: Checklist de Claves para Producción, 4. IA: Modo Mock Activo (Coste Cero), 5. Proveedores SMTP para Supabase Auth (Opciones Futuras), 6. Resumen de Apertura de la Alpha, Guía de Puesta en Marcha Alpha (Zero-Cost & Free Staging), Opción 1: Resend (Recomendada) (+2 more)

### Community 68 - "Guía de Despliegue, Staging y Configuración de Dominio"
Cohesion: 0.22
Nodes (8): 1. Despliegue en Vercel, 2. Configuración de Dominio y Certificados HTTPS, 3. Configuración de Supabase para el Dominio de Producción, 4. Configuración de Stripe Webhooks en Modo Alpha / Producción, Guía de Despliegue, Staging y Configuración de Dominio, Opción Recomendada: Subdominio de Aplicación (`app.tu-dominio.com`), Repositorio, Variables de Entorno en Vercel (Staging y Production)

### Community 69 - "Benchmark manual de proveedores de imagen"
Cohesion: 0.33
Nodes (5): Benchmark manual de proveedores de imagen, Paquete reproducible, Propósito, Registro del benchmark, Reglas

### Community 71 - "20260815040000_stripe_billing.sql"
Cohesion: 0.60
Nodes (4): public.apply_credit_purchase(), public.stripe_events, public.sync_stripe_subscription(), public.subscriptions

### Community 72 - "GenerationsSection"
Cohesion: 0.50
Nodes (4): GenerationsSection(), handleCancel(), statusVariant(), cancelGenerationAction()

## Knowledge Gaps
- **613 isolated node(s):** `metadata`, `metadata`, `metadata`, `metadata`, `metadata` (+608 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 714 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `properties.ts` to `generations.ts`, `cn`, `package.json`, `createClient`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `react` connect `cn` to `properties.ts`, `package.json`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `metadata`, `metadata`, `metadata` to the rest of the system?**
  _613 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.054873054873054876 - nodes in this community are weakly interconnected._
- **Should `domain.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `properties.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `MASTER.md` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._