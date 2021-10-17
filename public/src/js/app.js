var deferredPrompt;
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/serviceWorker.js").then(() => {
    console.log("Service Worker registered");
  });
}

/**
 * scope can defined for the service worker, only pages defined will be able to use
  navigator.serviceWorker
    .register("/serviceWorker.js", { scope: "/help/" })
    .then(() => {
      console.log("Service Worker registered");
    });
 */

// beforeinstallprompt is triggered by the chrome right before it is about to show the banner
window.addEventListener("beforeinstallprompt", (e) => {
  console.log("beforeinstallprompt fired");
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  return false;
  // Update UI notify the user they can install the PWA
  //   showInstallPromotion();
  // Optionally, send analytics event that PWA install promo was shown.
  //   console.log(`'beforeinstallprompt' event was fired.`);
});
