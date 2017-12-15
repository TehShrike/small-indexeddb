const pMap = require('p-map')
const version = 1

module.exports = function getDatabaseStore(databaseName, storeName) {
	return new Promise((resolve, reject) => {
		const openRequest = window.indexedDB.open(databaseName, version)

		openRequest.onupgradeneeded = () => {
			openRequest.result.createObjectStore(storeName)
		}
		openRequest.onblocked = () => reject(new Error('onblocked'))
		openRequest.onerror = () => reject(openRequest.error)
		openRequest.onsuccess = () => {
			const db = openRequest.result

			resolve(dbStore(db, storeName))
		}
	})
}

const dbStore = (db, storeName) => ({
	read(keys) {
		assert(Array.isArray(keys), 'Must pass an array to "read"')
		const transactionType = `readonly`

		return runQueriesInTransaction({ db, storeName, transactionType }, store =>
			pMap(keys, key =>
				promisifyRequest(store, store => store.get(key))
			)
		)
	},
	write(keyValuePairs) {
		assert(Array.isArray(keyValuePairs), 'Must pass an array to "write"')
		const sanitizedKeyValuePairs = keyValuePairs.map(makeKeyValue)
		const transactionType = `readwrite`

		return runQueriesInTransaction({ db, storeName, transactionType }, store =>
			pMap(sanitizedKeyValuePairs, ({ key, value }) =>
				promisifyRequest(store, store => store.put(value, key))
			)
		)
	},
	delete(keys) {
		assert(Array.isArray(keys), 'Must pass an array to "delete"')
		const transactionType = `readwrite`

		return runQueriesInTransaction({ db, storeName, transactionType }, store =>
			pMap(keys, key =>
				promisifyRequest(store, store => store.delete(key))
			)
		)
	},
})

function runQueriesInTransaction({ db, storeName, transactionType }, fn) {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(storeName, transactionType)
		const store = transaction.objectStore(storeName)

		const resultsPromise = fn(store)

		transaction.onerror = () => reject(transaction.error)
		transaction.oncomplete = () => resolve(resultsPromise)
	})
}

function promisifyRequest(store, fn) {
	return new Promise((resolve, reject) => {
		const request = fn(store)
		request.onerror = () => reject(request.error)
		request.onsuccess = () => resolve(request.result)
	})
}

function makeKeyValue(pair) {
	if (Array.isArray(pair)) {
		assert(pair.length === 2, 'key/value arrays must have exactly two elements')

		const [ key, value ] = pair
		return { key, value }
	} else {
		assert(pair && typeof pair === 'object',
			'"put" arguments must be an array or an object')
		assert(hasProperty(pair, 'key') && hasProperty(pair, 'value'),
			'key/value objects must have "key" and "value" properties')

		return pair
	}
}

function assert(predicate, message) {
	if (!predicate) {
		throw new Error(message)
	}
}

const hasProperty = (object, key) => key in object
