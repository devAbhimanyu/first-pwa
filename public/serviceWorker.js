//As SW has a more global scope having it in the public folder makes more sense
// install is triggered by the browser
self.addEventListener("install", (e) => {
  console.log("insalling sw", e);
  // using caches.open we can open a new cache
  e.waitUntil(
    caches.open("STATIC_ASSETS").then((cache) => {
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
  console.log("activated sw", e);
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
          return fetch(e.request);
        }
      })
      .catch((e) => {
        console.log(e);
      })
  );
});
