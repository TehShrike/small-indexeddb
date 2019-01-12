const defer = require(`p-defer`)

const version = 1
const storeName = `small-indexeddb`

module.exports = function getDatabaseStore(databaseName) {
	return new Promise((resolve, reject) => {
		const openRequest = window.indexedDB.open(databaseName, version)

		openRequest.onupgradeneeded = () => {
			openRequest.result.createObjectStore(storeName)
		}
		openRequest.onblocked = () => reject(new Error(`onblocked`))
		openRequest.onerror = () => reject(openRequest.error)
		openRequest.onsuccess = () => {
			const db = openRequest.result

			resolve(dbStore(db, storeName))
		}
	})
}

const dbStore = (db, storeName) => ({
	read(keys) {
		assert(Array.isArray(keys), `Must pass an array to "read"`)
		const transactionType = `readonly`

		return runQueriesInTransaction({ db, storeName, transactionType }, store =>
			keys.map(key => promisifyRequest(store.get(key)))
		)
	},
	write(keyValuePairs) {
		assert(Array.isArray(keyValuePairs), `Must pass an array to "write"`)
		const sanitizedKeyValuePairs = keyValuePairs.map(makeKeyValue)
		const transactionType = `readwrite`

		return runQueriesInTransaction({ db, storeName, transactionType }, store =>
			sanitizedKeyValuePairs.map(({ key, value }) => promisifyRequest(store.put(value, key)))
		)
	},
	delete(keys) {
		assert(Array.isArray(keys), `Must pass an array to "delete"`)
		const transactionType = `readwrite`

		return runQueriesInTransaction({ db, storeName, transactionType }, store =>
			keys.map(key => promisifyRequest(store.delete(key)))
		)
	},
	clear() {
		const transactionType = `readwrite`

		return runQueriesInTransaction({ db, storeName, transactionType }, store =>
			promisifyRequest(store.clear())
		)
	},
})

function runQueriesInTransaction({ db, storeName, transactionType }, fn) {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(storeName, transactionType)
		const store = transaction.objectStore(storeName)

		const promises = fn(store)

		const resultsPromise = Array.isArray(promises)
			? Promise.all(promises)
			: promises

		transaction.onerror = () => reject(transaction.error)
		transaction.oncomplete = () => resolve(resultsPromise)
	})
}

function promisifyRequest(request) {
	const deferred = defer()

	request.onerror = () => deferred.reject(request.error)
	request.onsuccess = () => deferred.resolve(request.result)

	return deferred.promise
}

function makeKeyValue(pair) {
	if (Array.isArray(pair)) {
		assert(pair.length === 2, `key/value arrays must have exactly two elements`)

		const [ key, value ] = pair
		return { key, value }
	} else {
		assert(pair && typeof pair === `object`,
			`"put" arguments must be an array or an object`)
		assert(hasProperty(pair, `key`) && hasProperty(pair, `value`),
			`key/value objects must have "key" and "value" properties`)

		return pair
	}
}

function assert(predicate, message) {
	if (!predicate) {
		throw new Error(message)
	}
}

const hasProperty = (object, key) => key in object
