# Goals

- small, like [idb-keyval](https://github.com/jakearchibald/idb-keyval) and [nanodb](https://github.com/lrlna/nanoidb)
- not large, like [localForage](https://github.com/localForage/localForage/blob/master/src/localforage.js) or [Dexie](https://github.com/dfahlander/Dexie.js/blob/master/src/Dexie.js) or [JsStore](https://github.com/ujjwalguptaofficial/JsStore/blob/master/Code/JsStore/JsStoreInstance.ts)
- not tiny - no code golfing here, maintainability first
- support reading and writing keys
- promise-based API, avoiding events
- tests
- expose transactions in a way that is easy to interact with and reason about

# IndexedDB model

- The browser exposes databases, identified by a string name
- Databases contain object stores, identified by a string name
- Object stores can have transactions applied to them with any number of read/write/delete actions

This library exposes the above ideas in a somewhat different way than the browser does, but I believe the core concepts hold.

# Notes

This library uses ES2015 language features.  If you want to use it in older browsers, you will need to transpile to ES5 and/or polyfill Promise, IndexedDB, etc in your own build.

# API

## `storePromise = smallIndexedDb(databaseName, storeName)`

Returns a promise that resolves to a store in the given database.  The store will be created if it does not exist yet.

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

# In the future maybe

- interact with schema versions?

# License

[WTFPL](http://wtfpl2.com)
