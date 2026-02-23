/**
 * Service Worker - Fitness Tracker PWA
 * Estrategia: Network-first con fallback a caché (funciona offline)
 */
const CACHE_NAME = 'fitness-tracker-v1';

// Solo cachear respuestas GET
function shouldCache(request) {
  return request.method === 'GET' && request.url.startsWith(self.location.origin);
}

// No cachear APIs que escriben datos
function skipCache(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/api/') && ['POST', 'PUT', 'DELETE'].includes(request.method);
}

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) { return name !== CACHE_NAME; })
          .map(function (name) { return caches.delete(name); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (!shouldCache(event.request) || skipCache(event.request)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        // No cachear respuestas no-ok o que no sean cacheables
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(function () {
        return caches.match(event.request).then(function (cachedResponse) {
          return cachedResponse || new Response('Sin conexión', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});
