-- Fase 1: grants de runtime-config. app_config es configuración del pipeline gestionada
-- por el lado servidor; service_role la lee/escribe vía API (scheduler + operaciones).
-- Sin secretos (la anon key es pública por diseño). anon/authenticated: sin acceso.

grant select, insert, update, delete on public.app_config to service_role;
