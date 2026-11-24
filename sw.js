// Service worker: guarda os arquivos do app para funcionar offline.
// Ao alterar index.html, estilo.css ou app.js, aumente o número da versão abaixo (v1 -> v2).
const CACHE = 'bolso-v6';
const ARQUIVOS = ['./', 'index.html', 'estilo.css', 'app.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-180.png'];

self.addEventListener('install', e => {
  // Tolerante: se algum arquivo faltar no GitHub, o app ainda instala.
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(ARQUIVOS.map(a => c.add(a).catch(() => null)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Abre do cache (rápido, offline) e atualiza o cache em segundo plano.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      const rede = fetch(e.request).then(r => {
        if (r && r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
        return r;
      }).catch(() => hit);
      return hit || rede;
    })
  );
});
