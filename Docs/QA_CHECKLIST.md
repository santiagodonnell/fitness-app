# Checklist de Pruebas Manuales (QA)

## Inicio y navegación
- Abrir `index.php`
  - Esperado: Tabs visibles; filtros sólo en Musculación; sin errores en consola.
- Cambiar entre tabs (Musculación, Cardio, Progresión, Nutrición, Asistente)
  - Esperado: Secciones alternan correctamente; filtros sólo en Musculación; ESC cierra modales/menús; el panel del asistente ajusta altura al viewport.

## Filtros de Musculación (sin botón)
- Cambiar "Día"
  - Esperado: Loader visible; lista actualiza resultados según día.
- Escribir en "Buscar" (p. ej., "press")
  - Esperado: Tras ~300ms (debounce), se actualiza la grilla; loader visible durante la carga.
- Forzar fallo (simular indisponibilidad de `api/data.php`)
  - Esperado: Toast "No se pudieron aplicar los filtros".

## Menú de acciones por ejercicio
- Abrir el menú (botón de tres puntos)
  - Esperado: Menú visible; `aria-label` contextual; click fuera/ESC lo cierra.

## Progreso (crear)
- Acción "Progreso" → completar 1-2 series → Guardar
  - Esperado: POST 200; toast "Progreso guardado"; se cierra el modal.
- Intento con campos vacíos
  - Esperado: Error (422) con toast de error.

## Progreso (gráfica)
- Acción "Visualización gráfica"
  - Esperado: GET 200; chart visible; botones "Peso" y "1RM (Epley)" alternan datasets sin recrear el chart; cerrar destruye la instancia.

## Progreso (tabla)
- Acción "Tabla"
  - Esperado: Cabecera con "Set n (kg)" según máximo detectado; filas ordenadas por fecha.
- Editar registro
  - Esperado: Prefill correcto; PUT 200; toast "Progreso actualizado".
- Eliminar registro
  - Esperado: Confirmación; DELETE 200; toast "Eliminado".

## Demostración (media local)
- Ejercicio con `media_url` (p. ej., `0001.gif` a `0003.gif`)
  - Esperado: Imagen/Video local visible en modal.
- Ejercicio sin `media_url`
  - Esperado: Toast "Sin archivo de demostración configurado".

## Cardio, Progresión y Notas
- Visitar cada sección
  - Esperado: Render correcto de listas/tablas conforme `data/data.json`.

## Chat asistente
- "Nuevo chat" → enviar mensaje
  - Esperado: Placeholder creado (POST devuelve `id`); animación en historial; indicador de tipeo; respuesta con efecto typewriter.
- Responder en el mismo hilo
  - Esperado: PUT sobre el mismo `id`; historial actualizado.
- Limpiar historial
  - Esperado: Confirmación; DELETE 200; toast "Historial eliminado".
- Eliminar ítem individual
  - Esperado: Confirmación; DELETE 200; toast "Elemento eliminado".
- Simular rate limit (429)
  - Esperado: Toast con segundos de reintento; botón re-habilitado después del tiempo indicado.

## Accesibilidad y UX
- Navegar con teclado menús/modales/botones
  - Esperado: Focus visible; ESC cierra modal/menú; `aria-label` presente en acciones (Progreso, Gráfica, Tabla, Editar, Eliminar).
- Redimensionar ventana y abrir Asistente
  - Esperado: Panel ajusta su alto al viewport libre.

## Consistencia técnica (rápida)
- Verificar en devtools que las llamadas usen:
  - `api/data.php`, `api/progreso.php`, `api/chat_history.php`, `api/ai_chat.php?insecure=1` (entorno dev).
- Confirmar toasts en casos de error de red/validación.


