-- USERS UPDATE HARDENING — cierre de seguridad de Fase 1.
-- Auditoría independiente (2026-08-16): la policy "users: update self" permitía
-- al usuario autenticado modificar cualquier columna de su propia fila, incluido
-- `role` (escalada latente) y `organization_id` (org-hopping).
--
-- Cambios:
-- 1. Grants a nivel de columna: `authenticated` conserva UPDATE solo sobre `email`
--    (campo benigno de perfil). RLS no puede restringir columnas; los grants de
--    columna sí. `role`, `organization_id` y el resto quedan fuera de alcance.
-- 2. Defensa en profundidad: la policy "users: update self" exige además que la
--    fila resultante conserve la organización del usuario autenticado
--    (organization_id = current_org_id()).

revoke update on public.users from authenticated;

grant update (email) on public.users to authenticated;

alter policy "users: update self" on public.users
  with check (id = auth.uid() and organization_id = public.current_org_id());