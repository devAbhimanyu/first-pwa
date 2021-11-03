const dbPromise = idb.open("post-store", 1, (db) => {
  db.createObjectStore("posts", { keyPath: "id" });
});

/**
 * writing data to a particular store
 * @param {string} storeKey
 * @param {*} data
 */
function writeToDb(storeKey, data) {
  return dbPromise.then((db) => {
    const transaction = db.transaction(storeKey, "readwrite");
    const store = transaction.objectStore(storeKey);
    store.put(data);
    return transaction.complete;
  });
}

/**
 * reading all store data
 * @param {string} storeKey
 * @returns
 */
function readFromDb(storeKey) {
  return dbPromise.then((db) => {
    const transaction = db.transaction(storeKey, "readonly");
    const store = transaction.objectStore(storeKey);
    return store.getAll();
  });
}

/**
 * clearing store data
 * @param {string} storeKey
 */
function clearStoreData(storeKey) {
  return dbPromise.then((db) => {
    const transaction = db.transaction(storeKey, "readwrite");
    const store = transaction.objectStore(storeKey);
    store.clear();
    return transaction.complete;
  });
}

/**
 * deleting singgle item from store data
 * @param {string} storeKey
 * @param {string} itemId
 */
function deleteItemFromStore(storeKey, itemId) {
  return dbPromise
    .then((db) => {
      const transaction = db.transaction(storeKey, "readwrite");
      const store = transaction.objectStore(storeKey);
      store.delete(itemId);
      return transaction.complete;
    })
    .then(() => {
      console.log("item deleted");
    });
}
