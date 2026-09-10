# DEVELOPMENT.md

## 1. Objetivo

Definir cómo se desarrolla, prueba y despliega el proyecto.

---

## 2. Principio

Trabajar en unidades pequeñas.

Cada tarea debe producir un cambio comprensible.

---

## 3. Ambientes

### Development

Uso local.

Variables:

.env.local

Nunca utilizar credenciales de producción.

---

### Staging

Entorno para probar integración.

Debe tener:

- Vercel staging;
- Supabase staging;
- Stripe test;
- AI keys de test cuando estén disponibles.

---

### Production

Solo código validado.

Vercel production.

Supabase production.

Stripe production.

---

## 4. Git

GitHub es el repositorio principal.

Ramas:

main
staging
feature/*

---

## 5. Regla de ramas

No desarrollar directamente sobre main.

Una tarea:

feature/property-create

Una tarea:

feature/image-generation-service

---

## 6. Commits

Los commits deben ser pequeños y descriptivos.

Ejemplo:

feat: add property creation flow

fix: prevent duplicate generation jobs

test: add generation authorization tests

---

## 7. Pull requests

Cada feature debe pasar por PR.

CI debe ejecutar:

- lint;
- typecheck;
- tests;
- build cuando corresponda.

---

## 7.1 Integración continua entre agentes

`origin/main` es el punto común de integración estable. Las ramas
especializadas permiten trabajar en paralelo, pero no representan productos
independientes ni deben acumular varias fases importantes sobre una base
antigua.

### Antes de comenzar una fase

Cada agente debe:

1. ejecutar `git fetch origin`;
2. comprobar el estado de `origin/main`;
3. comparar su rama con el punto de integración;
4. incorporar el `main` actualizado cuando corresponda;
5. resolver y validar cualquier conflicto antes de empezar trabajo nuevo.

### Durante una fase

- trabajar en una rama especializada;
- mantener el alcance pequeño;
- producir commits comprensibles y verificables;
- no modificar el dominio de otro agente sin necesidad demostrada;
- preservar contratos funcionales, seguridad, datos y arquitectura.

### Al terminar una unidad estable

1. validar la unidad especializada;
2. integrarla con el resto del producto sobre el `origin/main` actual;
3. repetir los checks del producto combinado;
4. actualizar `origin/main` mediante el flujo permitido, sin force push;
5. volver a sincronizar las ramas activas con el nuevo punto común.

### Regla de divergencia

Una rama especializada no debe continuar con múltiples fases importantes si
`origin/main` todavía no contiene unidades anteriores ya validadas. La
especialización debe producir paralelismo, no productos divergentes.

---

## 8. Agentes

Un agente debe trabajar en una tarea concreta.

No pedir:

"construye toda la aplicación".

Preferir:

"implementa creación de propiedades siguiendo PRODUCT.md, DATABASE.md y ARCHITECTURE.md".

---

## 9. Orden de trabajo

Antes de modificar código:

1. leer AGENTS.md;
2. leer documento relevante;
3. inspeccionar código existente;
4. identificar dependencias;
5. crear plan;
6. implementar;
7. ejecutar tests;
8. revisar cambios;
9. actualizar documentación;
10. commit.

---

## 10. Tests

### Unit

Probar:

- servicios;
- reglas;
- créditos;
- estados;
- validaciones.

### Integration

Probar:

- database;
- endpoints;
- RLS;
- generación;
- Stripe.

### E2E

Probar:

- registro;
- login;
- crear propiedad;
- subir imagen;
- generar;
- visualizar;
- descargar;
- billing.

---

## 11. Definition of Done

Una tarea no está terminada porque compile.

Debe:

- cumplir requisito;
- pasar tests;
- pasar lint;
- no romper arquitectura;
- no introducir secrets;
- mantener documentación cuando corresponda.

---

## 12. Cambios de arquitectura

Si una tarea requiere cambiar arquitectura:

DETENER.

Documentar:

- problema;
- alternativa;
- motivo;
- impacto.

La arquitectura no cambia accidentalmente durante una feature.

---

## 13. Deployment

Push
→ CI
→ tests
→ preview
→ revisión
→ merge
→ deployment.

---

## 14. Rollback

Las releases importantes deben poder revertirse.

Utilizar tags:

v0.1.0
v0.1.1

---

## 15. Local development

Comandos recomendados:

pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test:cloud
pnpm test:stripe
pnpm build

Supabase local:

supabase start
supabase functions serve

Cloud E2E (requiere proyecto enlazado y credenciales Cloud en `.env.local`):

pnpm test:cloud

El harness crea un usuario y datos temporales confirmados por la API administrativa,
ejecuta el pipeline con `MockAdapter`, aplica un timeout acotado y elimina sus datos al finalizar.

Stripe Test E2E (requiere el webhook Test y el bypass de protección de Vercel configurados):

pnpm test:stripe

El harness firma un evento Test de Checkout, comprueba la recarga de créditos y repite
el mismo evento para verificar la idempotencia. El evento, usuario y organización temporales se eliminan al finalizar.

Los comandos reales deben reflejar package.json.

---

## 16. Regla

Si un agente modifica mucho más código del necesario:

DETENER Y REVISAR.
