# Fitness Tracker - Configuración rápida

## Introducción

**Fitness Tracker** es una aplicación web para el seguimiento y planificación del entrenamiento personal. Permite consultar rutinas de musculación y cardio, registrar el progreso (peso, repeticiones, RPE) por ejercicio, visualizar gráficas de evolución y planificar la nutrición.

**Objetivo:** Centralizar en una sola herramienta la rutina semanal, el historial de progreso y un asistente virtual basado en IA (OpenAI) para obtener planes de entrenamiento personalizados según objetivos, experiencia y equipo disponible.

## Requisitos
- PHP >= 7.4
- Composer (para gestionar dependencias PHP)
- Extensiones PHP estándar (cURL, JSON)

## Instalación

1. **Crear la carpeta `data/`**. Copia los archivos de ejemplo desde `data.example/`:
   ```
   mkdir data
   copy data.example\data.json data\
   copy data.example\chat_history.json data\
   copy data.example\progresos.json data\
   ```
   En Linux/macOS:
   ```
   mkdir -p data && cp data.example/*.json data/
   ```

2. Instalar dependencias de PHP (si se usa el asistente con OpenAI):
```
composer require vlucas/phpdotenv
```

3. Crear archivo `.env` en la raíz del proyecto (no lo subas al repo):
```
OPENAI_API_KEY=tu_clave_openai
```

4. Estructura de scripts (orden de carga en `index.php`):
- `js/modules/api.js`
- `js/modules/ui.js`
- `js/modules/progreso.js`
- `js/modules/rutina.js`
- `js/modules/charts.js`
- `js/modules/data.js`
- `js/modules/chat.js`
- `js/modules/bootstrap.js`
- `js/app.js`

## Estructura de archivos en `data/`

| Archivo | Descripción | Estructura |
|---------|-------------|------------|
| `data.json` | Rutinas, cardio, progresión y notas nutricionales | Objeto con `rutina`, `cardio`, `progresion`, `notas` |
| `chat_history.json` | Historial de conversaciones del asistente | Array de objetos `{id, created_at, user, assistant}` o con `messages` |
| `progresos.json` | Registros de peso/repeticiones por ejercicio | Array de `{id, dia, ejercicio, fecha, series, notas, created_at}` |

Ver `data.example/` para plantillas completas. La API genera `id`, `created_at` y `updated_at` automáticamente en `progresos` y `chat_history`; en los ejemplos solo se documenta el formato esperado.

## Desarrollo
- El filtrado de Musculación se dispara por cambios en los campos (sin botón Aplicar) con debounce de 300ms.
- La sección Asistente carga `api/chat_history.php` solo cuando el hash es `#sec-asistente`.
- Los medios de demostración se sirven desde `assets/images/`.

## Variables de entorno
- `OPENAI_API_KEY`: clave usada por `api/ai_chat.php`.

## Notas
- En desarrollo, `api/ai_chat.php` permite `?insecure=1` para relajar verificación SSL si fuese necesario.
- No subas `.env` ni la carpeta `data/` al repositorio (están en `.gitignore`).
