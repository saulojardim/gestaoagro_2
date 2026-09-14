/* Service Worker do "Gestão do Rebanho"
   Guarda os arquivos do app no aparelho para abrir mesmo sem internet.
   (Os DADOS do gado ficam no IndexedDB, separado deste cache.) */

const CACHE = "rebanho-v49";
const CORE = ["./", "./index.html", "./manifest.json", "./icon.png", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./boi.png", "./bezerro.png"];

// Instala: baixa e guarda os arquivos essenciais
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

// Ativa: limpa caches antigos de versões anteriores
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Busca: tenta o cache primeiro; se não tiver, vai à rede e guarda;
// se estiver offline e for navegação, devolve o index.html
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit =>
      hit || fetch(e.request).then(res => {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
        return res;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
