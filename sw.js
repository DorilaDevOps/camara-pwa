const CACHE_NAME = 'camara-vivo-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Instalación: cachea los assets principales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activación: limpia cachés antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Estrategia Network-First (para que siempre esté actualizado el video)
self.addEventListener('fetch', event => {
  // Si es una petición a YouTube, NO la cacheamos
  if (event.request.url.includes('youtube.com') || 
      event.request.url.includes('googlevideo.com') ||
      event.request.url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clona la respuesta y guárdala en caché
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});