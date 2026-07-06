var CACHE='prometinfo-v2';
self.addEventListener('install',function(e){ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-180.png','./icon-192.png','./icon-512.png']); }).catch(function(){})); });
self.addEventListener('activate',function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.map(function(k){ if(k!==CACHE) return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch',function(e){ var req=e.request; if(req.method!=='GET') return;
  if(req.mode==='navigate'){ e.respondWith(fetch(req).then(function(r){ caches.open(CACHE).then(function(c){ c.put('./index.html', r.clone()); }); return r; }).catch(function(){ return caches.match('./index.html'); })); return; }
  var u=new URL(req.url);
  if(u.origin===location.origin && /\.(webmanifest|svg)$/.test(u.pathname)){ e.respondWith(caches.match(req).then(function(m){ return m||fetch(req); })); }
});