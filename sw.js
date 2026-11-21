const V = "arka-v1";
const SHELL = [
  "./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png",
  "https://cdn.tailwindcss.com/3.4.17",
  "https://cdnjs.cloudflare.com/ajax/libs/lucide/0.263.1/lucide.min.js"
];
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(V)
      .then(c => Promise.all(SHELL.map(u =>
        fetch(u, { mode: u.startsWith("http") ? "no-cors" : "same-origin" })
          .then(r => c.put(u, r)).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.url.includes("api.open-meteo.com")) return; // cuaca ditangani cache di aplikasi
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(r => {
        if (r && (r.ok || r.type === "opaque")) {
          const copy = r.clone();
          caches.open(V).then(c => c.put(req, copy));
        }
        return r;
      }).catch(() => hit || (req.mode === "navigate" ? caches.match("./index.html") : undefined));
      return hit || net;
    })
  );
});
