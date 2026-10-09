// Service Worker: speichert den Morsetrainer auf dem Gerät, damit er offline läuft.
// Strategie: sofort aus dem Speicher liefern und im Hintergrund aktualisieren –
// eine neue Version erscheint also beim übernächsten Start mit Internet.
const CACHE = "morsetrainer-v1";
const DATEIEN = ["./", "./index.html", "./manifest.webmanifest",
                 "./icon-180.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(DATEIEN)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((namen) =>
    Promise.all(namen.filter((n) => n !== CACHE).map((n) => caches.delete(n)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const gespeichert = await cache.match(e.request, { ignoreSearch: true });
    const netz = fetch(e.request).then((antwort) => {
      if (antwort.ok) cache.put(e.request, antwort.clone());
      return antwort;
    }).catch(() => gespeichert);
    if (gespeichert) {
      e.waitUntil(netz);
      return gespeichert;
    }
    return netz;
  }));
});
