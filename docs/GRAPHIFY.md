# Graphify

## 1. Qué es

Graphify es una herramienta opcional de análisis de código que indexa el repositorio y construye un grafo de conocimiento navegable (nodos = símbolos/archivos, aristas = llamadas/imports/relaciones), con detección de comunidades, "god nodes" y conexiones sorprendentes. La salida son tres artefactos: `graph.json` (datos), `graph.html` (visualización interactiva en el navegador, sin servidor) y `GRAPH_REPORT.md` (informe en lenguaje llano).

## 2. Rol en el proyecto

Graphify es una **herramienta auxiliar y opcional**. Es un respaldo para la navegación y las consultas, nunca la fuente primaria de verdad. Las fuentes primarias del contexto del proyecto son:

- `AGENTS.md`
- `docs/*.md` (PRODUCT.md, MVP.md, ARCHITECTURE.md, TECH_STACK.md, TECHNICAL_DECISIONS.md, DATABASE.md, AI.md, BILLING.md, SECURITY.md, DEVELOPMENT.md, etc.)

Consultar Graphify no es obligatorio y no reemplaza la lectura de Markdown, código o documentación. El grafo puede estar desactualizado hasta que se re-ejecute la extracción (ver punto 5).

## 3. Skill de proyecto

La skill de proyecto para agentes OpenCode está instalada en:

```
.opencode/skills/graphify/SKILL.md
.opencode/skills/graphify/references/
.opencode/skills/graphify/.graphify_version
```

Esta es la ruta oficial de OpenCode para skills de proyecto (`.opencode/skills/`), escrita por el instalador oficial `graphify install --platform opencode --project`. No es un plugin ni un hook: se invoca a demanda con `/graphify` y no interfiere con el flujo normal del agente.

## 4. Artefactos versionados

El grafo se genera en `graphify-out/` en la raíz del proyecto. Se versionan solo los artefactos útiles:

| Archivo | Contenido |
|---|---|
| `graphify-out/graph.json` | Datos del grafo (nodos/aristas/comunidades) |
| `graphify-out/graph.html` | Visualización interactiva (abrir en navegador) |
| `graphify-out/GRAPH_REPORT.md` | Informe de auditoría (god nodes, conexiones, comunidades) |
| `graphify-out/manifest.json` | Manifest de extracción para updates incrementales |

Se ignoran (`.gitignore`) los artefactos locales de máquina: `.graphify_python`, `.graphify_root`, `.graphify_analysis.json`, `.graphify_labels.json`, `.graphify_labels.json.sig`, `cache/` y `cost.json`.

## 5. Cómo reconstruir el grafo

```bash
# Extracción completa local (solo código, AST, sin API key)
graphify extract . --code-only

# Análisis: comunidades, etiquetas, reporte y HTML
graphify cluster-only .
graphify export html

# Actualización incremental tras cambios de código (sin costo, sin LLM)
graphify update .
```

## 6. Cómo consultar el grafo

```bash
graphify query "¿Cómo conecta la acción de generación con el worker?"
graphify query "<pregunta>" --dfs        # recorrido en profundidad
graphify query "<pregunta>" --budget 1500
graphify path "create_generation" "process-generation/index.ts"   # camino más corto
graphify explain "GenerationsSection"    # explicación de un nodo
```

## 7. Sin API keys

El análisis es 100% local. La extracción de código usa AST y no requiere ninguna clave. La extracción semántica de docs/PDFs/imágenes sí requeriría un LLM (Gemini opcional), por lo que este proyecto usa `--code-only` para mantenerse sin API key ni costos. El informe lo confirma: 0 tokens input/output.

## 8. Limitaciones

- No sustituye la lectura del código ni la documentación.
- El grafo solo contiene código (archivos TS/TSX, SQL, config); los `docs/*.md` no se indexan sin un paso LLM.
- El grafo queda "stale" tras cambios de código hasta correr `graphify update .`; `GRAPH_REPORT.md` registra el commit con el que fue construido.
- El análisis del reporte es un resumen automático; las decisiones de arquitectura se toman según `docs/` y los humanos.

## 9. Instalación (mantenimiento)

```bash
uv tool install "graphifyy[sql]"   # el extra sql indexa migraciones .sql
graphify --version                 # 0.9.46 en la instalación actual
```

El binario queda en `~/.local/bin` (añadirlo al PATH o usar la ruta completa). El extra `tree_sitter_sql` es necesario para que las migraciones de `supabase/migrations/` entren en el grafo.