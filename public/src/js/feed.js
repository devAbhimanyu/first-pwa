var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
var form = document.querySelector("form");
var titleInput = document.querySelector("#title");
var locationInput = document.querySelector("#location");

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  // setTimeout(function() {
  createPostArea.style.transform = "translateY(0)";
  // }, 1);
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      console.log(choice);
      if (choice.outcome === "dismissed") {
        console.log("User cancelled installation");
      } else {
        console.log("User added to Homescreen");
      }
    });
    //so that it can be only used once
    deferredPrompt = null;
  }
}

function unregisterSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (var i = 0; i < registrations.length; i++) {
        registrations[i].unregister();
      }
    });
  }
}

function closeCreatePostModal() {
  // createPostArea.style.display = "none";
  createPostArea.style.transform = "translateY(100vh)";
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

/**
 * removing all cards before a new card is added
 */
function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

// cache on demand
function onSaveButtonClicked(event) {
  console.log("clicked");
  if ("caches" in window) {
    caches.open("user-requested").then(function (cache) {
      cache.add("https://httpbin.org/get");
      cache.add("/src/images/sf-boat.jpg");
    });
  }
}

function createCard(data) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = "url(" + data.image + ")";
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = data.caption;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = "center";
  // var cardSaveButton = document.createElement("button");
  // cardSaveButton.textContent = "Save";
  // cardSaveButton.addEventListener("click", onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data = []) {
  data.forEach((d) => {
    createCard(d);
  });
}

var url = "http://localhost:3000/posts";
var networkDataReceived = false;

function sendData(payload) {
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  }).then(function (res) {
    console.log("Sent data", res);
    updateUI();
  });
}

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    console.log("fetch from network", data);
    updateUI(data);
  });

if ("indexedDB" in window) {
  readFromDb("posts").then((data) => {
    if (!networkDataReceived) {
      console.log("from indexedDB cache", data);
      updateUI(data);
    }
  });
}

form.addEventListener("submit", () => {
  event.preventDefault();
  if (titleInput.value.trim() === "" || locationInput.value.trim() === "") {
    alert("Please enter valid input");
    return;
  }
  closeCreatePostModal();
  var payload = {
    id: new Date().toISOString(),
    caption: titleInput.value,
    location: locationInput.value,
    image:
      "https://firebasestorage.googleapis.com/v0/b/pwa-test-app-6d2b4.appspot.com/o/sf-boat.jpg?alt=media&token=880c2cf8-b845-46a4-9284-685e21a69b97",
  };
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then(function (sw) {
      writeToDb("sync-posts", payload)
        .then(function () {
          //this creates an event tag, which can be accessed in the
          return sw.sync.register("sync-new-posts");
        })
        .then(function () {
          var snackbarContainer = document.querySelector("#confirmation-toast");
          var data = { message: "Your Post was saved for syncing!" };
          snackbarContainer.MaterialSnackbar.showSnackbar(data);
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  } else {
    sendData(payload);
  }
});
