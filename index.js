import defer from 'p-defer'

const version = 1

export default function getDatabaseStore(databaseName) {
	const storeName = databaseName

	return new Promise((resolve, reject) => {
		const openRequest = window.indexedDB.open(databaseName, version)

		openRequest.onupgradeneeded = () => {
			openRequest.result.createObjectStore(storeName)
		}
		openRequest.onblocked = () => reject(new Error(`onblocked`))
		openRequest.onerror = () => reject(openRequest.error)
		openRequest.onsuccess = () => {
			const db = openRequest.result

			resolve((transactionType, fn) => runQueriesInTransaction({ db, storeName, transactionType }, fn))
		}
	})
}

function runQueriesInTransaction({ db, storeName, transactionType }, fn) {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(storeName, transactionType)
		const store = transaction.objectStore(storeName)

		const requests = fn(store)

		const resultsPromise = Array.isArray(requests)
			? Promise.all(requests.map(promisifyRequest))
			: promisifyRequest(requests)

		transaction.onerror = () => reject(transaction.error)
		transaction.oncomplete = () => resolve(resultsPromise)
	})
}

function promisifyRequest(request) {
	const deferred = defer()

	request.onerror = err => {
		// prevent global error throw https://bugzilla.mozilla.org/show_bug.cgi?id=872873
		if (typeof err.preventDefault === `function`) {
			err.preventDefault()
		}
		deferred.reject(request.error)
	}

	request.onsuccess = () => deferred.resolve(request.result)

	return deferred.promise
}
