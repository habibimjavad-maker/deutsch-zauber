const V='dz-v10',SHELL=['./','index.html','words.json','verbs.json','expressions.json','grammar.json','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(
 caches.open(V).then(c=>Promise.all(SHELL.map(u=>fetch(new Request(u,{cache:'reload'})).then(r=>r.ok&&c.put(u,r)).catch(()=>{}))))
 .then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(
 caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
// اول از اینترنت (همیشه تازه‌ترین نسخه)، فقط اگر آفلاین بودی از حافظه
self.addEventListener('fetch',e=>{
 const q=e.request;
 if(q.method!=='GET'||new URL(q.url).origin!==location.origin)return;
 e.respondWith((q.mode==='navigate'?fetch(q):fetch(q,{cache:'no-cache'}))
  .then(r=>{if(r.ok){const c=r.clone();caches.open(V).then(ch=>ch.put(q,c))}return r})
  .catch(()=>caches.match(q).then(h=>h||caches.match('index.html'))));
});
