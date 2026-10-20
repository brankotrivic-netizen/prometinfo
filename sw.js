var CACHE='prometinfo-v10';
var ASSETS=['./index.html','./manifest.webmanifest','./icon.svg','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(function(c){ return Promise.all(ASSETS.map(function(u){ return fetch(u,{cache:'reload'}).then(function(r){ if(r.ok)return c.put(u,r); }).catch(function(){}); })); })); });
self.addEventListener('activate',function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.map(function(k){ if(k!==CACHE) return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('message',function(e){ if(e.data==='SKIP_WAITING')self.skipWaiting(); });
self.addEventListener('push',function(e){ var d={}; try{ d=e.data?e.data.json():{}; }catch(x){ d={title:'PrometInfo',body:e.data?e.data.text():''}; }
  e.waitUntil(self.registration.showNotification(d.title||'PrometInfo',{body:d.body||'',icon:'icon-192.png',badge:'icon-192.png',tag:d.tag||'prometinfo',renotify:true,data:{url:d.url||'./'}})); });
self.addEventListener('notificationclick',function(e){ e.notification.close(); var u=(e.notification.data&&e.notification.data.url)||'./';
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(function(ws){ for(var i=0;i<ws.length;i++){ if('focus' in ws[i]) return ws[i].focus(); } return clients.openWindow(u); })); });
self.addEventListener('fetch',function(e){ var req=e.request; if(req.method!=='GET') return;
  if(req.mode==='navigate'){ e.respondWith(fetch(req,{cache:'no-store'}).then(function(r){ if(r.ok)caches.open(CACHE).then(function(c){ c.put('./index.html',r.clone()); }); return r; }).catch(function(){ return caches.match('./index.html'); })); return; }
  var u=new URL(req.url);
  if(u.origin===location.origin && /\.(webmanifest|svg)$/.test(u.pathname)){ e.respondWith(fetch(req,{cache:'no-cache'}).then(function(r){ if(r.ok)caches.open(CACHE).then(function(c){c.put(req,r.clone());}); return r; }).catch(function(){return caches.match(req);})); }
});