var CACHE='prometinfo-v9';
var ASSETS=['./index.html','./manifest.webmanifest','./icon.svg','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(function(c){ return Promise.all(ASSETS.map(function(u){ return fetch(u,{cache:'reload'}).then(function(r){ if(r.ok)return c.put(u,r); }).catch(function(){}); })); })); });
self.addEventListener('activate',function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.map(function(k){ if(k!==CACHE) return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('message',function(e){ if(e.data==='SKIP_WAITING')self.skipWaiting(); });
self.addEventListener('fetch',function(e){ var req=e.request; if(req.method!=='GET') return;
  if(req.mode==='navigate'){ e.respondWith(fetch(req,{cache:'no-store'}).then(function(r){ if(r.ok)caches.open(CACHE).then(function(c){ c.put('./index.html',r.clone()); }); return r; }).catch(function(){ return caches.match('./index.html'); })); return; }
  var u=new URL(req.url);
  if(u.origin===location.origin && /\.(webmanifest|svg)$/.test(u.pathname)){ e.respondWith(fetch(req,{cache:'no-cache'}).then(function(r){ if(r.ok)caches.open(CACHE).then(function(c){c.put(req,r.clone());}); return r; }).catch(function(){return caches.match(req);})); }
});