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
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeName, `readonly`)
			const store = transaction.objectStore(storeName)

			const resultsPromise = pMap(keys, key => new Promise((resolve, reject) => {
				const request = store.get(key)

				request.onerror = () => reject(request.error)
				request.onsuccess = () => {
					resolve(request.result)
				}
			}))

			transaction.onerror = () => reject(transaction.error)
			transaction.oncomplete = () => resolve(resultsPromise)
		})
	},
	write(keyValuePairs) {
		const sanitizedKeyValuePairs = keyValuePairs.map(makeKeyValue)

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeName, `readwrite`)
			const store = transaction.objectStore(storeName)

			const resultsPromise = pMap(sanitizedKeyValuePairs, ({ key, value }) =>
				new Promise((resolve, reject) => {
					const request = store.put(value, key)

					request.onerror = () => reject(request.error)
					request.onsuccess = resolve
				})
			)

			transaction.onerror = () => reject(transaction.error)
			transaction.oncomplete = () => {
				resultsPromise.then(resolve, reject)
			}
		})
	},
})

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
