/* Offline cache for Pesticide MoA Tool + Kheti Dawa Guide */
var CACHE='moa-tool-v1';
var FILES=['./','./index.html','./manifest.json','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png','./farmer/','./farmer/index.html','./farmer/manifest.json','./farmer/icons/icon-192.png','./farmer/icons/icon-512.png','./farmer/icons/maskable-512.png','./farmer/icons/apple-touch-icon.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return Promise.all(FILES.map(function(f){return c.add(f).catch(function(){});}));}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.method!=='GET')return;
  var u=new URL(r.url);
  if(u.origin!==location.origin)return;
  e.respondWith(
    caches.match(r,{ignoreSearch:true}).then(function(hit){
      var net=fetch(r).then(function(res){
        if(res&&res.status===200){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(r,copy);});}
        return res;
      }).catch(function(){return hit||(r.mode==='navigate'?caches.match('./index.html'):undefined);});
      return hit||net;
    })
  );
});
