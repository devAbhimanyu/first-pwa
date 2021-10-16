//As SW has a more global scope having it in the public folder makes more sense
// install is triggered by the browser
self.addEventListener("install", (e) => {
  console.log("insalling sw", e);
});
// activate is triggered by the browser
self.addEventListener("activate", (e) => {
  console.log("activated sw", e);
  return self.clients.claim(); //makes sure that the sw are installed and activated properly
});

// fetch is triggered by the web app
self.addEventListener("fetch", (e) => {
  console.log("fetch made", e);
  e.respondWith(fetch(e.request));
});

let deferredPrompt;
// beforeinstallprompt is triggered by the web app
self.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can install the PWA
  showInstallPromotion();
  // Optionally, send analytics event that PWA install promo was shown.
  console.log(`'beforeinstallprompt' event was fired.`);
});