importScripts("/src/js/idb.js");
importScripts("/src/js/utils.js");

//As SW has a more global scope having it in the public folder makes more sense
const STATIC_ASSETS = "STATIC_ASSETS-V8";
const DYNAMIC = "DYNAMIC-V2";
const FALLBACK_PAGE = "/fallback.html";

const STATIC_FILES = [
  "/",
  "/index.html",
  "/fallback.html",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/promise.js",
  "/src/js/fetch.js",
  "/src/js/idb.js",
  "/src/js/utils.js",
  "/src/js/material.min.js",
  "/src/css/app.css",
  "/src/css/feed.css",
  "/src/images/main-image.jpg",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
];

/**
 * trim cache object to store particular elements
 */
function trimCache(cacheName, maxItems) {
  caches.open(cacheName).then(function (cache) {
    return cache.keys().then(function (keys) {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
      }
    });
  });
}

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
      cache.addAll(STATIC_FILES);
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

// function isInArray(url, array = []) {
//   const val = array.find((val) => val === url);
//   return val ? true : false;
// }
function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) {
    // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log("matched ", string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

/** cache then network */
self.addEventListener("fetch", function (event) {
  var url = "http://localhost:3000/posts";
  //eg check if fetch from api then use update cache
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      fetch(event.request).then((res) => {
        const clonedRes = res.clone();
        clearStoreData("posts")
          .then(() => {
            console.log("cloning");
            return clonedRes.json();
          })
          .then((data = []) => {
            console.log("loop area");
            if (Array.isArray(data)) {
              data.forEach((d) => {
                writeToDb("posts", d);
              });
            } else {
              writeToDb("posts", data);
            }
          });
        return res;
      })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    // if request if for static file use cache only
    event.respondWith(caches.match(event.request));
  } else {
    // if other request use cache
    event.respondWith(
      caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function (res) {
              return caches.open(DYNAMIC).then(function (cache) {
                if (event.request.url.startsWith("http")) {
                  // trimCache(DYNAMIC, 3);
                  cache.put(event.request, res.clone());
                }
                return res;
              });
            })
            .catch(function (err) {
              return caches.open(STATIC_ASSETS).then(function (cache) {
                if (event.request.headers.get("accept").includes("text/html"))
                  return cache.match(FALLBACK_PAGE);
              });
            });
        }
      })
    );
  }
});

/**
 * background sync, listens to the sync event
 */
self.addEventListener("sync", function (event) {
  console.log("[Service Worker] Background syncing", event);
  if (event.tag === "sync-new-posts") {
    const url = "http://localhost:3000/posts";
    console.log("[Service Worker] Syncing new Posts");
    event.waitUntil(
      readFromDb("sync-posts").then(function (data) {
        // debugger;
        for (var dt of data) {
          const payload = {
            id: dt.id,
            caption: dt.caption,
            location: dt.location,
            image: dt.image,
          };
          fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          })
            .then(function (res) {
              // debugger;
              console.log("Sent data", res);
              if (res.ok) {
                res.json().then(function (resData) {
                  deleteItemFromStore("sync-posts", resData.id);
                });
              }
            })
            .catch(function (err) {
              console.log("Error while sending data", err);
            });
        }
      })
    );
  }
});
