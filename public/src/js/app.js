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
