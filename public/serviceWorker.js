//As SW has a more global scope having it in the public folder makes more sense
const STATIC_ASSETS = "STATIC_ASSETS-V12";
const DYNAMIC = "DYNAMIC-V1";
const FALLBACK_PAGE = "/fallback.html";
// install is triggered by the browser
self.addEventListener("install", (e) => {
  console.log("insalling sw", e);
  // using caches.open we can open a new cache
  e.waitUntil(
    caches.open(STATIC_ASSETS).then((cache) => {
      console.log("sw precaching app shell");
      // to successfuly add to cache it should return a status 200
      // the key is a request obj not a string
      // cache.add("/");
      // cache.add("/index.html");
      // cache.add("/src/js/app.js");
      // cache.addAll uses a string[, which holds all the request
      cache.addAll([
        "/",
        "/index.html",
        "/fallback.html",
        "/src/js/app.js",
        "/src/js/feed.js",
        "/src/js/promise.js",
        "/src/js/fetch.js",
        "/src/js/material.min.js",
        "/src/css/app.css",
        "/src/css/feed.css",
        "/src/images/main-image.jpg",
        "https://fonts.googleapis.com/css?family=Roboto:400,700",
        "https://fonts.googleapis.com/icon?family=Material+Icons",
        "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
      ]);
    })
  );
});

// activate is triggered by the browser
self.addEventListener("activate", (e) => {
  console.log("activating sw", e);
  // cleaning old caches
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          // check if key is not the current ones being used
          if (key !== STATIC_ASSETS && key !== DYNAMIC) {
            console.log("cache removed", key);
            // delete cache for keys not being used
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim(); //makes sure that the sw are installed and activated properly
});

// fetch is triggered by the web app
self.addEventListener("fetch", (e) => {
  // e.respondWith(fetch(e.request));
  e.respondWith(
    caches
      .match(e.request)
      .then((response) => {
        if (response) {
          return response;
        } else {
          return fetch(e.request)
            .then((res) =>
              caches.open(DYNAMIC).then((cache) => {
                // store the response clone and send the actual respose back
                if (e.request.url.startsWith("http")) {
                  cache.put(e.request, res.clone());
                }
                return res;
              })
            )
            .catch((err) => {
              console.log(err);
              return caches.open(STATIC_ASSETS).then((cache) => {
                return cache.match(FALLBACK_PAGE);
              });
            });
        }
      })
      .catch((e) => {
        console.log(e);
      })
  );
});
