-- SECURITY HARDENING: Habilitar RLS en app_config y phase0_config
-- Defensa en profundidad: garantiza que el 100% de las tablas en public tengan RLS activo.
-- postgres y service_role conservan bypass RLS. Ningún rol público (anon/authenticated)
-- tiene políticas de acceso ni grants para estas tablas.

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phase0_config ENABLE ROW LEVEL SECURITY;
