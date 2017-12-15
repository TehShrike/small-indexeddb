module.exports = function defer() {
	let responded = false
	let rejected = false
	let response = undefined

	let reject = null
	let resolve = null

	const o = {
		reject(value) {
			if (reject) {
				reject(value)
			} else if (!responded) {
				rejected = true
				responded = true
				response = value
			}
		},
		resolve(value) {
			if (resolve) {
				resolve(value)
			} else if (!responded) {
				responded = true
				response = value
			}
		},
		promise: new Promise((res, rej) => {
			if (responded) {
				rejected ? rej(response) : res(response)
			}
			reject = rej
			resolve = res
		}),
	}

	return o
}
