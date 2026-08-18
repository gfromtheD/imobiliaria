# Graph Report - imobiliaria  (2026-08-18)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 448 nodes · 809 edges · 27 communities (23 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e60862e9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- properties.ts
- createClient
- compilerOptions
- generations-section.tsx
- domain.ts
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

## God Nodes (most connected - your core abstractions)
1. `cn()` - 40 edges
2. `createClient()` - 30 edges
3. `Button()` - 17 edges
4. `compilerOptions` - 16 edges
5. `getProperty()` - 10 edges
6. `Badge()` - 9 edges
7. `Card()` - 9 edges
8. `Label()` - 8 edges
9. `CardContent()` - 8 edges
10. `Database` - 7 edges

## Surprising Connections (you probably didn't know these)
- `ForgotPasswordForm()` --indirect_call--> `resetPasswordAction()`  [INFERRED]
  components/auth/forgot-password-form.tsx → services/auth.ts
- `RegisterForm()` --indirect_call--> `registerAction()`  [INFERRED]
  components/auth/register-form.tsx → services/auth.ts
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `CardFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `AlertDialogMedia()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (27 total, 4 thin omitted)

### Community 0 - "cn"
Cohesion: 0.09
Nodes (39): metadata, metadata, AuthCard(), ForgotPasswordForm(), initialState, initialState, initialState, RegisterForm() (+31 more)

### Community 1 - "properties.ts"
Cohesion: 0.10
Nodes (22): metadata, metadata, PropertiesPage(), EditPropertyPage(), metadata, PropertyDetailPage(), metadata, NewRoomPage() (+14 more)

### Community 2 - "createClient"
Cohesion: 0.13
Nodes (23): metadata, RoomDetailPage(), metadata, HomePage(), LoginForm(), GenerationForm(), createClient(), loginAction() (+15 more)

### Community 3 - "compilerOptions"
Cohesion: 0.07
Nodes (29): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+21 more)

### Community 4 - "generations-section.tsx"
Cohesion: 0.13
Nodes (20): metadata, GenerationsSection(), handleCancel(), GenerationViewItem, statusVariant(), DeletePropertyButton(), Badge(), badgeVariants (+12 more)

### Community 5 - "domain.ts"
Cohesion: 0.09
Nodes (25): RoomCard(), RoomUploadForm(), handleSubmit(), validateFile(), ALLOWED_IMAGE_MIME, GENERATION_STATUSES, MAX_IMAGE_BYTES, MAX_ROOMS_PER_PROPERTY (+17 more)

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
Cohesion: 0.12
Nodes (18): APP_ROUTE_PREFIXES, AUTH_ROUTES, isAppRoute(), isAuthRoute(), createClient(), updateSession(), CompositeTypes, Constants (+10 more)

### Community 11 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 12 - "settings/page.tsx"
Cohesion: 0.24
Nodes (10): AppLayout(), metadata, SettingsPage(), AppSidebar(), SidebarNavLink(), SignOutButton(), SUBSCRIPTION_PLAN_LABELS, CurrentOrganization (+2 more)

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

## Knowledge Gaps
- **133 isolated node(s):** `PropertyRow`, `CompositeTypes`, `DatabaseWithoutInternals`, `DefaultSchema`, `Enums` (+128 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `generations-section.tsx`, `page-skeleton.tsx`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `createClient()` connect `createClient` to `properties.ts`, `domain.ts`, `generations-section.tsx`, `settings/page.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `Button()` connect `cn` to `properties.ts`, `generations-section.tsx`, `settings/page.tsx`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `PropertyRow`, `CompositeTypes`, `DatabaseWithoutInternals` to the rest of the system?**
  _133 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.08646616541353383 - nodes in this community are weakly interconnected._
- **Should `properties.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1032258064516129 - nodes in this community are weakly interconnected._
- **Should `createClient` be split into smaller, more focused modules?**
  _Cohesion score 0.12873563218390804 - nodes in this community are weakly interconnected._