# Goals

- support key/value operations in bulk
- promise-based API, avoiding events
- expose multi-query transactions in a way that is easy to interact with and reason about
- small, like [idb-keyval](https://github.com/jakearchibald/idb-keyval) and [nanodb](https://github.com/lrlna/nanoidb)
- not large, like [localForage](https://github.com/localForage/localForage/blob/master/src/localforage.js) or [Dexie](https://github.com/dfahlander/Dexie.js/blob/master/src/Dexie.js) or [JsStore](https://github.com/ujjwalguptaofficial/JsStore/blob/master/Code/JsStore/JsStoreInstance.ts)
- not tiny - no code golfing here, maintainability first
- tests

# IndexedDB model

- The browser exposes databases, identified by a string name
- Databases contain object stores, identified by a string name
- Object stores can have transactions applied to them with any number of read/write/delete actions

This library exposes the above ideas in a somewhat different way than the browser does, but I believe the concepts hold.

# API

```js
import smallIndexedDb from 'small-indexeddb'
```

## `promise = smallIndexedDb(databaseName)`

Returns a promise that resolves to a `transaction` function for the given database.  The store will be created if it does not exist yet.

Under the hood, the store name will be the same as the database name.

## `promise = transaction(mode, callbackFunction)`

[`mode` must be either `'readonly'`, `'readwrite'` or `'readwriteflush'`.](https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/transaction#Parameters)

`callbackFunction` will be called immediately with a single [`IDBObjectStore`](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore) parameter.

Your callback function must return either an [`IDBRequest`](https://developer.mozilla.org/en-US/docs/Web/API/IDBRequest) or an array of `IDBRequests`.

The returned promise will return the result of the single `IDBRequest`, or an array containing the results of all the requests you returned.

```js
async function main() {
	const transaction = await smallIndexedDb('sweetness')

	await transaction(`readwrite`, idbStore => idbStore.put(`totally a`, `a`))

	const [ a, b ] = await transaction(`readonly`, idbStore => [
		idbStore.get(`a`),
		idbStore.get(`b`),
	])

	console.log(a, b)
}
```

# License

[WTFPL](http://wtfpl2.com)
