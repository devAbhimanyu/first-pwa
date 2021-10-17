var deferredPrompt;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/serviceWorker.js")
    .then(() => {
      console.log("Service Worker registered");
    })
    .catch((e) => {
      console.log("an error occurred");
      console.error(e);
    });
}

// beforeinstallprompt is triggered by the chrome right before it is about to show the banner
window.addEventListener("beforeinstallprompt", (e) => {
  console.log("beforeinstallprompt fired");
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  return false;
});
