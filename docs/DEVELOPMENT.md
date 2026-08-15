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
pnpm test
pnpm test:e2e
pnpm build

Supabase local:

supabase start
supabase functions serve

Los comandos reales deben reflejar package.json.

---

## 16. Regla

Si un agente modifica mucho más código del necesario:

DETENER Y REVISAR.
