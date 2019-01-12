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

# Notes

This library uses ES2015 language features.  If you want to use it in older browsers, you will need to polyfill Promise, IndexedDB, etc and/or transpile to ES5 in your own build.

# API

```js
import smallIndexedDb from 'small-indexeddb'
```

## `storePromise = smallIndexedDb(databaseName)`

Returns a promise that resolves to a store in the given database.  The store will be created if it does not exist yet.

Under the hood, the store name will be the same as the database name.

```js
smallIndexedDb('myCoolDb').then(store => {
	store.write({ key: 'aww', value: 'yeah' })
})
```

## `valuesPromise = store.read(keysArray)`

Returns a promise that resolves to an array of values matching the given array of key strings.

```js
store.read([ 'a', 'b', 'c' ]).then(results => {
	results // => [ 1, 2, 3 ]
})
```

Keys without a corresponding value in the database will be `undefined`.

## `promise = store.write(keyValueArray)`

Write a collection of key/value pairs to the store in a single transaction.

The key/value pairs can either be expressed as an object (`{ key: 'keyWat', value: { lol: 'whee' } }`) or an array (`[ 'keyWat', { lol: 'whee' } ]`)


```js
store.write([
	[ 'a', 1 ],
	{ key: 'b', value: 2 }
]).catch(err => {
	console.error('Oh no, something went wrong!', err)
})
```

## `promise = store.delete(keysArray)`

Delete any number of keys from the store.

```js
store.delete([ 'key1', 'key2' ])
```

## `promise = store.clear()`

Wipe the store.

## `promise = store.transaction(mode, synchronousCallbackFn)`

[`mode` must be either `'readonly'`, `'readwrite'` or `'readwriteflush'`.](https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/transaction#Parameters)

`synchronousCallbackFn` will be called immediately with a single [`IDBObjectStore`](https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore) parameter.

Your function must return either an [`IDBRequest`](https://developer.mozilla.org/en-US/docs/Web/API/IDBRequest) or an array of IDBRequests.

The returned promise will return the result of the single IDBRequest, or an array containing the results of all the requests you returned.

```js
store.transaction(`readwrite`, idbStore => idbStore.put(`totally a`, `a`)).then(() => {
	return store.transaction(`readonly`, idbStore => [
		idbStore.get(`a`),
		idbStore.get(`b`),
	]).then(([ a, b ]) => {
		console.log(a, b)
	})
})
```

# License

[WTFPL](http://wtfpl2.com)
