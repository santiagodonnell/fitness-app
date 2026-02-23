# PWA - Progressive Web App

Fitness Tracker funciona como una **Progressive Web App (PWA)**, permitiendo instalación en dispositivos móviles y escritorio, funcionamiento parcial offline y experiencia similar a una aplicación nativa.

---

## Requisitos

- **HTTPS**: La PWA debe servirse bajo HTTPS (o `localhost` en desarrollo).
- Navegadores compatibles: Chrome, Edge, Safari (iOS 11.3+), Firefox, Samsung Internet.

---

## Archivos de la PWA

| Archivo             | Descripción                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| `manifest.json`     | Metadatos de la app: nombre, iconos, colores, modo de visualización       |
| `sw.js`             | Service Worker que gestiona el caché y el comportamiento offline          |
| `assets/icons/`     | Iconos 192x192 y 512x512 para la instalación                              |

---

## Manifest (`manifest.json`)

- **name**: Nombre completo: "Fitness Tracker"
- **short_name**: Nombre corto para el icono: "Fitness"
- **display**: `standalone` — la app se abre sin barra del navegador
- **theme_color**: `#0056b3` (alineado con `--primary-color`)
- **background_color**: Color de pantalla de carga
- **orientation**: `portrait-primary` para uso móvil
- **start_url**: Punto de entrada (`./`)

---

## Service Worker (`sw.js`)

### Estrategia de caché

- **Network-first con fallback a caché**: Intenta obtener la versión más reciente desde la red; si falla (sin conexión), sirve la última versión cacheada.
- Solo se cachean peticiones **GET** del mismo origen.
- Las operaciones **POST, PUT, DELETE** a `/api/` no se cachean.

### Ciclo de vida

1. **install**: El SW se instala de inmediato (`skipWaiting`).
2. **activate**: Limpia cachés antiguas y toma control de la página.
3. **fetch**: Intercepta peticiones y aplica la estrategia de caché.

### Actualización del caché

Al cambiar contenido estático (CSS, JS), las URLs con `?v=timestamp` provocan nuevas entradas en caché. Para forzar que los usuarios reciben la última versión, incrementa la versión del caché en `sw.js` (`CACHE_NAME`).

---

## Instalación

### Escritorio (Chrome, Edge)

- Menú ⋮ → **Instalar Fitness Tracker** / **Aplicación instalada**
- O icono de instalación en la barra de direcciones.

### Móvil (Android)

- Menú ⋮ → **Añadir a pantalla de inicio** / **Instalar app**

### iOS (Safari)

- Botón **Compartir** → **Añadir a pantalla de inicio**

---

## Comprobación en DevTools

1. **Application** → **Manifest**: revisar metadatos e iconos.
2. **Application** → **Service Workers**: verificar que el SW esté registrado y activo.
3. **Application** → **Cache Storage**: ver entradas en `fitness-tracker-v1`.
4. **Lighthouse** → categoría **Progressive Web App**: ejecutar auditoría PWA.

---

## Limitaciones conocidas

- **APIs dinámicas**: `api/data.php`, `api/ai_chat.php`, etc. requieren conexión; en offline solo se muestran datos ya cacheados.
- **Chat IA**: Sin conexión no funcionan las respuestas del asistente.
- **Iconos**: `icon-192.png` e `icon-512.png` son la misma imagen redimensionada; para mejor resultado se pueden generar iconos específicos para cada tamaño.

---

## Despliegue en subdirectorio

Si la app se sirve en un subdirectorio (ej. `example.com/fitness-app/`):

- El manifest usa rutas relativas (`./`, `assets/icons/...`).
- El SW se registra con `sw.js` (ruta relativa).
- Los `scope` y `start_url` se resuelven respecto al manifest.

---

## Referencias

- [Web.dev - PWA](https://web.dev/progressive-web-apps/)
- [MDN - Service Worker API](https://developer.mozilla.org/es/docs/Web/API/Service_Worker_API)
- [MDN - Web App Manifest](https://developer.mozilla.org/es/docs/Web/Manifest)
