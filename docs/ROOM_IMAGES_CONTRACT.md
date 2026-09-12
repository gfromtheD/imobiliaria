# Contrato backend: Rooms e imágenes

## Modelo

`rooms` representa una estancia y puede no tener imágenes. `room_images` representa cada original privado de esa estancia. Su identidad y `storage_path` son persistentes.

`room_images` es la fuente de verdad. `rooms.original_image_path` es un espejo **legacy temporal** para el formulario visual anterior; no debe usarse para crear ni procesar generaciones nuevas. La columna se retirará cuando ese formulario consuma `RoomImage`.

Límites provisionales técnicos: 20 Rooms por propiedad y 20 imágenes activas por propiedad. No expresan pricing.

## Lifecycle de imagen

`pending` → `ready` tras una subida que exista en Storage. `deleting` representa una limpieza iniciada que puede reanudarse sin perder la ruta. Las imágenes `pending` se listan normalmente, por lo que una nueva sesión puede reintentar la misma ruta o solicitar su borrado.

1. `create_room_image(room_id, file_name)` devuelve `image_id`, `upload_path` y estado `pending`.
2. El cliente sube el archivo a `original-images` en esa ruta privada.
3. `finalize_room_image_upload(image_id, upload_path)` verifica organización, Room, estado y existencia en Storage; después devuelve `ready`.

## Contratos server-side

- `createRoom(propertyId, roomType, notes)` crea una Room sin imágenes.
- `createRoomImageUpload(roomId, fileName)` inicia una imagen pendiente.
- `listRoomImages(roomId)` recupera imágenes `pending`, `ready` y `deleting`.
- `finalizeRoomImageUpload(imageId, uploadPath)` confirma una subida.
- `updateRoom(roomId, roomType, notes)` actualiza los únicos campos editables.
- `deleteRoomImage(imageId)` prepara la limpieza, borra Storage y confirma el borrado. Es reintentable.
- `deleteRoom(roomId)` cancela jobs pending con su reembolso/ledger, prepara los objetos, los elimina de ambos buckets y solo entonces borra la Room. Si Storage falla, la Room queda marcada y la misma llamada reanuda la limpieza.

El formulario antiguo sigue usando `createRoomAction` y `finalizeRoomUploadAction`: crea una primera `RoomImage` pendiente y mantiene el espejo legacy exclusivamente durante la transición.

## Generations

`generations.source_image_id` es obligatorio. `create_generation` acepta `p_source_image_id`; con varias imágenes ready, omitirlo devuelve `source_image_required`. Solo se conserva la resolución implícita temporal cuando existe exactamente una imagen ready.

El worker lee siempre la `room_image` de la generación y comprueba Room, organización y estado `ready` antes de cargar bytes privados.

## Seguridad y borrado

RLS permite a una organización leer solo sus `room_images`. Las mutaciones de Room e imagen se realizan por RPC con validación organización → propiedad → Room → imagen. Storage solo admite subida/reintento para una fila `pending` propia y borrado para una fila `deleting` propia.

No se puede borrar una imagen que sea fuente de una generación. Para borrar una Room se mantiene el registro y sus rutas hasta que `complete_room_deletion` verifica que no quedan objetos en `original-images` ni `staged-images`; no existe una falsa transacción entre PostgreSQL y Storage.
