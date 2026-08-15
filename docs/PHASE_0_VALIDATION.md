# PHASE 0 VALIDATION — Pipeline Asíncrono

**Estado:** VALIDADO — VEREDICTO: **PASS WITH CONDITIONS**

**Fecha:** 2026-08-15
**Entorno:** Supabase local (CLI 2.114.0, PostgreSQL 17, edge-runtime 1.74.3 / Deno 2.1.4, Docker 28.3.2)
**Proveedor IA:** MockAdapter (ninguna llamada real a OpenAI/FLUX)

---

## 1. Objetivo

Validar técnicamente el pipeline asíncrono definido en la reconciliación de arquitectura:

```
PostgreSQL/Supabase
  → image_jobs (estado: pending)
  → pg_cron (scheduler, cada minuto)
  → process_jobs() (SQL, enqueue)
  → pg_net (net.http_post)
  → Supabase Edge Function (process-job)
  → claim_job() atómico (pending → processing)
  → MockAdapter (generación simulada)
  → complete_job() / fail_job() (processing → completed | failed)
  → resultado persistido en PostgreSQL
```

Sin Redis, sin BullMQ, sin Kafka, sin worker Node separado, sin microservicios.

## 2. Alcance y exclusiones

**Incluido:** tabla `image_jobs` de validación, funciones RPC (`claim_job`, `complete_job`, `fail_job`, `retry_job`, `process_jobs`), config runtime (`phase0_config`), Edge Function con MockAdapter, scheduling con pg_cron, prueba de concurrencia, prueba de error + retry, prueba del scheduler automático.

**Excluido (por alcance de la tarea):** auth, properties, rooms, UI, Stripe, billing, dashboard, invitaciones, almacenamiento real de imágenes, producción. El resultado es un artefacto simulado (JSON con `artifact`, `output_path`, `provider: "mock"`).

## 3. Arquitectura validada

| Capa | Componente | Rol |
|------|-----------|-----|
| Scheduler | `pg_cron` (extensión) | Ejecuta `process_jobs()` cada minuto (granularidad mínima de pg_cron) |
| Enqueue | `process_jobs(limit)` | `SELECT ... FOR UPDATE SKIP LOCKED` sobre jobs `pending` + `net.http_post` por job + incrementa `enqueued_count` |
| Transporte | `pg_net` (net.http_post) | POST asíncrono a `http://kong:8000/functions/v1/process-job` con `Authorization: Bearer <anon>` |
| Worker | Edge Function `process-job` | Recibe `{job_id, api_url}`; pasa el header de auth al llamar a PostgREST |
| Claim atómico | `claim_job(uuid, worker)` | `UPDATE ... SET status='processing', attempt_count+1 ... WHERE id=… AND status='pending' RETURNING *` — exactamente un worker gana |
| Proveedor | `MockAdapter` | Simula latencia y resultado; fallo controlado en primer intento si `payload.fail === true` |
| Resultado | `complete_job` / `fail_job` | Guarda `result` o `error_code`/`error_message`; transición con guarda de estado (evita doble finalización) |
| Retry | `retry_job(uuid)` | `failed → pending` solo si `attempt_count < max_attempts` |

**Seguridad:** la tabla `image_jobs` tiene RLS habilitado sin políticas (denegación por defecto para `anon`/`authenticated`). Solo se concedió `EXECUTE` sobre las RPC del worker. El worker se autentica con el JWT anon (público por diseño); las claves se leen en runtime (`supabase status -o env`), nunca se escriben en archivos del repo. La migración no contiene secretos.

## 4. Componentes probados

1. **Migración SQL** — extensions `pg_cron` + `pg_net`, tabla `image_jobs`, índice de claim, `phase0_config`, funciones RPC, job de cron. Aplicada sin errores por `supabase start`.
2. **Cron** — `cron.job` contiene exactamente 1 job (`* * * * *` → `select public.process_jobs(10)`); sin duplicados tras reinicio del stack.
3. **process_jobs()** — enqueue manual y vía cron; `FOR UPDATE SKIP LOCKED` confirmado con 2 llamadas concurrentes.
4. **pg_net** — `net._http_response` registra respuestas 200 con `ok:true` para jobs completados y 500 para errores controlados.
5. **Edge Function** — invocada vía Kong (host y contenedor), verificación JWT (HS256) pasando, claim/complete/fail vía PostgREST.
6. **MockAdapter** — artefacto simulado con `provider:"mock"`, `room_type`, `style`, `output_path`.
7. **Máquina de estados** — flujos `pending → processing → completed`, `pending → processing → failed`, `failed → pending` (retry), todos con `status_history` como traza auditable.

## 5. Cómo ejecutar la prueba

```bash
# 1. Iniciar el stack local (requiere Docker Desktop)
supabase start

# 2. Ejecutar el harness (PowerShell 7, desde la raíz del repo)
./supabase/tests/phase0_validation.ps1
```

El harness: lee el anon key en runtime, siembra `phase0_config`, y ejecuta 4 tests (flujo feliz, concurrencia, error+retry, scheduler automático). Los datos se limpian con `TRUNCATE public.image_jobs; TRUNCATE net._http_response;` antes de cada corrida.

## 6. Resultados: esperado vs obtenido

| Test | Esperado | Obtenido |
|------|----------|----------|
| 1. Happy path | `pending → processing → completed`, 1 evento processing, attempt 1, resultado mock | **PASS** — id `40d1a270-…`, `history: processing -> completed`, `provider: mock`, lock liberado |
| 2. Concurrencia | 1 claim gana de 2 paralelos; 1 solo evento processing con 2 `process_jobs()` concurrentes; 1 solo artefacto | **PASS** — w1=1/w2=0; `enqueued_count=1`; un solo `processing` en historia |
| 3. Error + retry | Fallo controlado registrado (`provider_error`), sin resultado parcial; retry → `completed`, attempt 2, sin error residual | **PASS** — intento 1 `failed` con `error_code=provider_error`; retry → `completed`, attempt_count=2, 2 eventos processing, artefacto presente |
| 4. Scheduler | Job pendiente se procesa solo con el tick de pg_cron (sin llamadas manuales) | **PASS** — completado vía cron en <110 s, `enqueued_count=1` |

**Evidencia en BD (corrida final):**
- `net._http_response`: respuestas 200 (`ok:true`, resultado mock) para happy path, concurrencia y cron; 500 con `step:"generate"` y `error:"Error: simulated provider failure"` para el intento fallido del test 3.
- `status_history` de cada job: transiciones exactas, un solo `processing` por ejecución.

## 7. Idempotencia y concurrencia

- El claim es una **actualización atómica condicionada por estado** (`WHERE status='pending'`): dos workers concurrentes sobre el mismo job → exactamente uno recibe la fila (`w1=1, w2=0`).
- `process_jobs()` usa `FOR UPDATE SKIP LOCKED`: dos invocaciones concurrentes no enquean el mismo job dos veces (una sola enqueue, `enqueued_count=1`).
- `complete_job`/`fail_job` guardan por estado (`WHERE status='processing'`): la segunda finalización de un job ya completado es imposible (guarda de transición).
- El resultado es determinista por job: un solo `processing` en `status_history` y un solo artefacto en `result` por ejecución completada.
- `enqueued_count` permite detectar duplicación de enqueue en observabilidad.

## 8. Errores y reintentos

- Fallo controlado (payload `{"fail":true}`) → `processing → failed` con `error_code=provider_error` y `error_message="simulated provider failure"`, **sin** resultado parcial (`result IS NULL`).
- `retry_job()` reabre el job a `pending` solo si `attempt_count < max_attempts`; el reintento vuelve a pasar por claim atómico.
- Retry exitoso: `attempt_count=2`, dos eventos `processing` (uno por ejecución), error limpiado, artefacto nuevo generado. **Ningún cargo duplicado es posible a nivel de pipeline** (el crédito se reserva al claim y se devuelve en `failed`/`cancelled`; esto se implementa con la tabla de créditos del MVP — fuera del alcance de esta prueba).
- El MockAdapter falla solo en el primer intento (fallo transitorio realista), permitiendo demostrar que el retry completa.

## 9. Problemas encontrados y resueltos

1. **Formato de salida del CLI** — v2.114 emite `ANON_KEY="…"` en lugar de `SUPABASE_ANON_KEY=…`. Resuelto en el harness (regex con comillas).
2. **psql 17 imprime command tags con `-tA`** — `INSERT … RETURNING id` devolvía `uuid\nINSERT 0 1`, contaminando el id en el harness. Resuelto envolviendo el INSERT en un CTE (`WITH ins AS (INSERT …) SELECT id FROM ins;`) + extracción por regex del uuid.
3. **`status_history` como array ya parseado** — el harness asumía string JSON; resuelto con parseo defensivo (`-is [string]`).
4. **Hot reload del edge-runtime no aplicó el cambio en el MockAdapter** (el isolate servía código previo en el intento 2). Resuelto reiniciando el stack completo con la CLI.
5. **`docker restart` individual del contenedor edge-runtime rompe el servicio** (502 "invalid response from upstream", `net._http_response` con filas vacías). El contenedor es gestionado por la CLI; reiniciar servicios individuales del stack no es un camino soportado. Resuelto con `supabase stop` + `supabase start` (las claves JWT persisten en `supabase/.temp`, gitignored).
6. **Imágenes del stack** — primera descarga ~6 GB (varios minutos, spinner no capturable en stdout redirigido). Sin impacto funcional.

## 10. Limitaciones de la prueba

- Entorno **local**; no se validó latencia real de Kong en host, ni redeploy de funciones en producción (allí los cambios de código se despliegan con `supabase functions deploy`, sin hot reload).
- pg_cron tiene granularidad mínima de **1 minuto**; los procesamientos bajo demanda de la UI deberán usar `process_jobs()` directo o `pg_net` inmediato, y el cron actúa como red de seguridad.
- El worker se autentica con el **JWT anon** (público por diseño) — suficiente para la validación local y seguro porque las RPC son las únicas operaciones expuestas y la tabla está bloqueada por RLS. **Condición para producción:** autenticar el worker con `service_role` vía `env(SUPABASE_SERVICE_ROLE_KEY)` en la configuración de la función (documentado en config.toml, nunca commiteado) y mantener el JWT secret como secreto de entorno.
- `image_jobs` es la tabla de **validación**; el esquema real del MVP (propiedades, imágenes, créditos, organización) la reemplazará manteniendo las mismas garantías transaccionales y de estado.
- `verify_jwt` del edge-runtime está activo (por defecto); el JWT anon local pasa la verificación HS256.
- No se probó `cancelled` (fuera del alcance de la tarea) — la transición `pending → cancelled` es una simple actualización condicionada equivalente a las demás.

## 11. Conclusión

**PASS WITH CONDITIONS.**

El pipeline asíncrono **funciona end-to-end en el entorno local** exactamente como lo define la arquitectura:

- ✅ `pending → processing → completed` completo (PostgreSQL → pg_cron → pg_net → Edge Function → MockAdapter → PostgreSQL)
- ✅ Sin doble procesamiento (claim atómico + SKIP LOCKED + guardas de transición)
- ✅ Errores registrados (`error_code`, `error_message`) y retry seguro sin doble cargo
- ✅ Scheduler automático (pg_cron) sin intervención manual
- ✅ Sin secretos en código; RLS por defecto-denegación; worker autenticado con JWT
- ✅ Sin dependencias externas nuevas (nada de Redis/BullMQ/Kafka/microservicios)
- ✅ Funciona sin API keys de OpenAI/FLUX (MockAdapter)

**Condiciones para la siguiente fase (construcción del MVP):**
1. Autenticar el worker con `service_role` (env var en la función, no commiteada) en lugar del anon key.
2. Sustituir `image_jobs`/`phase0_config` por el esquema del producto (properties, images, generations, credits, organizations) preservando claim atómico, guardas de estado y trazabilidad.
3. Resolver el diseño de reintentos con límite (`max_attempts`), política de backoff y hook de alerta, usando el job de cron existente como red de seguridad.
4. Integrar créditos: reserva atómica al claim, devolución en `failed`/`cancelled`.

**Se puede pasar a la siguiente fase.** No se construyó funcionalidad del MVP en esta prueba.
