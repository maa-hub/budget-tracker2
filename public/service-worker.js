const FILES_TO_CACHE = [

    "./index.html",
    "./css/styles.css",
    "./js/index.js",
    "./manifest.json",
    "./js/idb.js"
  ];
  
  const CACHE_NAME = "static-cache-v2";
  const DATA_CACHE_NAME = "data-cache-v1";
  self.addEventListener("install", function (evnt) {
    evnt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log("Installed cache");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
    self.skipWaiting();
  });
  self.addEventListener("activate", function (evnt) {
    evnt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
    self.clients.claim();
  });
  self.addEventListener("fetch", function (evnt) {
    if (evnt.request.url.includes("/api/")) {
      evnt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evnt.request)
            .then(response => {
              if (response.status === 200) {
                cache.put(evnt.request.url, response.clone());
              }
              return response;
            })
            .catch(err => {
              return cache.match(evnt.request);
            });
        }).catch(err => console.log(err))
      );
      return;
    }
    evnt.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(evnt.request).then(response => {
          return response || fetch(evnt.request);
        });
      })
    );
  }); 