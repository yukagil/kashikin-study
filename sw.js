const C="kashikin-v6";
const FILES=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET"){return;}
  const isHTML = req.mode==="navigate" || req.destination==="document";
  if(isHTML){
    // ネットワーク優先: 常に最新のHTMLを取得。オフライン時のみキャッシュにフォールバック
    e.respondWith(
      fetch(req).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put("./index.html",cp));return r;})
                .catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match("./index.html")))
    );
  } else {
    // 静的アセットはキャッシュ優先
    e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req)));
  }
});
