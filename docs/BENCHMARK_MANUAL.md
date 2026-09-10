# Benchmark manual de proveedores de imagen

## Propósito

Este procedimiento permite comparar calidad visual sin usar ninguna API, SDK,
automatización de navegador ni credencial de proveedor. Es una herramienta de
desarrollo; no forma parte de la experiencia de una inmobiliaria ni modifica
generaciones, créditos o resultados de producción.

## Paquete reproducible

Para cada caso, crear un JSON local con el script de Deno:

```powershell
deno run --allow-write supabase/scripts/export_manual_benchmark.ts `
  --generation-id <uuid-local> `
  --original-path <organization_id>/<property_id>/<room_id>.jpg `
  --room-type salón `
  --preset modern `
  --out benchmarks/runs/salon-modern.json
```

El JSON contiene el identificador del caso, la ruta privada del original, el
preset, la política de fidelidad y las instrucciones resueltas. No contiene la
imagen, una signed URL, una clave ni una solicitud a un proveedor.

Un miembro autorizado descarga manualmente el original desde Ambivio, usa el
prompt del paquete en una herramienta que esté autorizado a utilizar y conserva
el resultado en almacenamiento local de benchmark. No automatizar ninguna
interfaz de consumidor ni asociar ese resultado a una generación de producto.

## Registro del benchmark

Usar `docs/benchmarks/case-template.json` para cada uno de los 30 casos. Las
categorías mínimas son salón, dormitorio, comedor, despacho, estancia pequeña,
estancia grande, distintas perspectivas, puertas/ventanas visibles y casos
difíciles.

Registrar en cada ficha:

- proveedor y modelo probado;
- paquete JSON utilizado;
- ubicación local del resultado, nunca una URL firmada;
- alteración estructural crítica (sí/no);
- geometría, puertas/ventanas y perspectiva preservadas;
- realismo, integración de mobiliario, adecuación al preset y artefactos;
- utilidad comercial final (sí/no) y observaciones.

## Reglas

- No subir imágenes a un proveedor durante esta fase de preparación.
- No poner paquetes ni outputs de benchmark en `original-images` o `staged-images`.
- No consumir ni alterar créditos.
- No presentar un benchmark manual como una generación producida por Ambivio.
- La decisión de proveedor requiere una fase posterior aprobada y una revisión
  de privacidad, coste y resultados del conjunto completo.
