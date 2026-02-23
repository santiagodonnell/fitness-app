# Archivos de ejemplo para `data/`

Copia estos archivos a la carpeta `data/` (creada localmente, ignorada por Git).

## data.json

Contiene rutinas, cardio, plan de progresión y notas nutricionales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `rutina.dias` | objeto | Claves: días de la semana (ej. "Lunes", "Martes"). Valor: `{grupos_musculares: string[], ejercicios: [...]}` |
| `rutina.dias[].ejercicios[]` | array | Cada ejercicio: `media_url` (nombre archivo en `assets/images/`), `nombre`, `nombre_en`, `series`, `reps` |
| `cardio` | objeto | Clave = día, valor = descripción del cardio |
| `progresion` | objeto | Fases con `duracion`, `peso`, `series_reps`, `incremento`, etc. |
| `notas` | objeto | `registro`, `alimentacion` (proteina, carbohidratos, grasas, deficit) |

## chat_history.json

Array de conversaciones del asistente. Cada elemento (creado por la API):

| Campo | Tipo |
|-------|------|
| `id` | string (generado) |
| `created_at` | string ISO 8601 |
| `user` | string (primer mensaje del usuario) |
| `assistant` | string (primera respuesta) |
| `messages` | array opcional: `[{role: "user"|"assistant", content: string}]` |
| `updated_at` | string ISO 8601 (en actualizaciones PUT) |

Valor inicial: `[]`

## progresos.json

Array de registros de progreso por ejercicio. Cada elemento (creado/actualizado por la API):

| Campo | Tipo |
|-------|------|
| `id` | string (generado) |
| `dia` | string (ej. "Lunes") |
| `ejercicio` | string (nombre exacto del ejercicio) |
| `fecha` | string (YYYY-MM-DD) |
| `series` | array de `{n, peso, reps, descanso, rpe}` |
| `notas` | string opcional |
| `created_at` | string ISO 8601 |
| `updated_at` | string ISO 8601 (opcional) |

Valor inicial: `[]`
