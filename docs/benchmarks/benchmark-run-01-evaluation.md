# Evaluación visual — benchmark-run-01

Fecha de evaluación: 2026-09-13. Este informe registra una comparación manual
de seis pares `original`/`result` generados fuera de Ambivio. No se usó API,
no se automatizó ChatGPT y los resultados no se asociaron a generaciones,
créditos ni Storage de producto.

Los paquetes y las fichas locales residen en
`benchmarks/benchmark-run-01/case-01` a `case-06`. El proveedor fue ChatGPT
Image; el modelo exacto no quedó registrado y no se infiere en este informe.

## Cobertura y método

Los seis casos tienen original, resultado y `benchmark.json` con instrucciones
`v1`. Se compararon encuadre, geometría, superficies, huecos, elementos
estructurales, vista exterior, escala, integración, realismo, adecuación de
estancia/preset y utilidad comercial. Las puntuaciones son una evaluación
comparativa manual sobre 10, no una métrica automática.

| Caso | Estancia / preset | Fidelidad arquitectónica | Realismo | Utilidad comercial | Severidad / causa |
| --- | --- | ---: | ---: | ---: | --- |
| case-01 | baño / minimalista v1 | 9.5 | 8.0 | 8.5 | BAJA / E |
| case-02 | cocina / moderno v1 | 9.0 | 8.0 | 8.0 | MEDIA / A |
| case-03 | dormitorio / nórdico v1 | 9.0 | 9.0 | 9.0 | BAJA / E |
| case-04 | dormitorio / minimalista v1 | 9.5 | 9.0 | 9.0 | BAJA / A |
| case-05 | salón / moderno v1 | 9.5 | 9.0 | 9.5 | BAJA / E |
| case-06 | terraza / lujo v1 | 8.5 | 9.0 | 8.5 | MEDIA / A |

## Resultados por caso

### case-01 — baño / minimalista v1

Conserva distribución, puerta, espejo, sanitarios, revestimientos y encuadre.
La decoración y luz cálida son creíbles. Los frentes del mueble bajo lavabo se
reinterpretan ligeramente y la cantidad de atrezzo es alta para un minimalismo
estricto. No hay alteración arquitectónica relevante. Clasificación **E**.

### case-02 — cocina / moderno v1

Conserva distribución, aparatos, puerta acristalada, suelo y encuadre; el
resultado moderno es convincente. La mesa y el mobiliario rojo preexistentes
parecen sustituirse, cuando el contrato actual permite añadir, no reemplazar.
Se clasifica **A**: la regla no es suficientemente explícita para bloquear
reemplazo o eliminación de mobiliario existente. Severidad **MEDIA**.

### case-03 — dormitorio / nórdico v1

Mantiene ventana, cortinas, banco, estantería, ventilación, suelo y escala. La
cama, escritorio y textiles son coherentes con el preset y fotorealistas. La
interpretación de estanterías e iluminación es más intensa que el original,
pero no constituye una alteración relevante. Clasificación **E**; severidad
**BAJA**.

### case-04 — dormitorio / minimalista v1

Preserva geometría, ventana, papel pintado, muebles empotrados y suelo. La
estancia resulta funcional y realista. Libros, plantas y luz integrada exceden
la idea de decoración muy contenida. Es una desviación de calibración del
preset, no de room type ni de arquitectura: clasificación **A**, severidad
**BAJA**.

### case-05 — salón / moderno v1

Conserva suelo, huecos acristalados, paredes, techo, vistas y encuadre. La
composición, escala y luz natural convierten el resultado en el más útil para
marketing. Las cortinas y el tono de luz reducen levemente la comparabilidad.
El icono de interfaz de la captura original desaparece y no se considera un
elemento arquitectónico. Clasificación **E**, severidad **BAJA**.

### case-06 — terraza / lujo v1

Conserva cerramientos, toldos, fachada, puertas, césped, estructura metálica y
vista urbana. El amueblamiento exterior cumple el preset lujo y es realista.
Sin embargo, convierte luz diurna en escena dorada y añade apliques/luminarias
que parecen instalaciones fijas, además de una densidad alta de vegetación y
mobiliario. Clasificación **A**, severidad **MEDIA**.

## Patrones y diagnóstico

No hay alteraciones estructurales críticas en los seis casos. Arquitectura,
perspectiva, puertas, ventanas y escala se conservan de forma consistentemente
alta; no hay evidencia de que falte un pre-análisis visual para el MVP.

El patrón repetido es otro: el contrato `v1` protege bien estructura fija pero
es insuficiente para limitar cambios de mobiliario existente, densidad
decorativa y transformación de iluminación/ambiente exterior. Los room types
se resuelven correctamente y los presets moderno, nórdico y lujo son
reconocibles; el preset minimalista tiende a decorarse en exceso.

**Diagnóstico: CONTRATO ACTUAL NECESITA AJUSTES.** La evidencia no atribuye los
fallos principales a falta de contexto visual ni justifica introducir una fase
de pre-análisis IA. Tampoco basta para concluir que el modelo sea insuficiente
o que sea necesario comparar proveedores: cuatro de seis casos son sólidos y
los dos desvíos medios responden directamente a ambigüedades del contrato.

## Recomendaciones no implementadas

1. Añadir una regla explícita de no eliminar, sustituir, mover ni rediseñar
   mobiliario, electrodomésticos y accesorios existentes, salvo un modo de
   reemplazo que el usuario seleccione expresamente.
2. Prohibir cambio de hora del día, clima, vista exterior e instalaciones fijas
   de iluminación; permitir solo iluminación de integración no estructural.
3. Convertir `minimalista` en restricciones observables: máximo de piezas
   añadidas y exclusión de decoración repetida.
4. Repetir el benchmark con más perspectivas difíciles antes de evaluar un
   proveedor alternativo.

## Siguiente experimento mínimo

Repetir únicamente `case-02` y `case-06` con el mismo modelo y originales,
añadiendo las dos prohibiciones de conservación de mobiliario existente y de
tiempo de día/iluminación fija. Comparar cada nueva salida con sus pares
actuales. Si persisten reemplazos o cambios de ambiente, entonces aislar si es
limitación del modelo antes de modificar el pipeline o introducir pre-análisis.
