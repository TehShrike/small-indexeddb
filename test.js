const test = require(`zora`)
const smallIndexedDb = require(`./bundle.js`)

test(`Read empty key`, async t => {
	const transaction = await smallIndexedDb(`dummyDb`)
	const result = await transaction('readonly', store => store.get(`wat`))
	t.equal(result, undefined)
})

test('Queries are run synchronously', async t => {
	const transaction = await smallIndexedDb(`dummyDb2`)
	let fired = false

	const resultPromise = transaction('readonly', store => {
		fired = true
		return store.get(`wat`)
	})

	t.equal(fired, true)

	return resultPromise
})

test(`Write values, then read them back`, async t => {
	const transaction = await smallIndexedDb(`someStore1`)

	await transaction('readwrite', store => [
		store.put('value1', 'key1'),
		store.put('value2', 'key2')
	])

	const value2 = await transaction('readonly', store => store.get('key2'))

	t.equal(value2, `value2`)

	const value1 = await transaction('readonly', store => store.get('key1'))

	t.equal(value1, `value1`)
})

test(`Write and read an array`, async t => {
	const transactionz = await smallIndexedDb(`someStore2`)

	await transactionz('readwrite', store =>
		[
			[ `key1`, `value1` ],
			[ `key2`, `value2` ],
			[ `key3`, `value3` ],
		].map(
			([ key, value]) => store.put(value, key)
		)
	)

	await transactionz('readwrite', store => store.delete('key2'))

	const [ value1, value2, value3 ] = await transactionz('readonly',
		store => [ `key1`, `key2`, `key3` ].map(key => store.get(key))
	)

	t.equal(value1, `value1`)
	t.equal(value2, undefined)
	t.equal(value3, `value3`)
})

test(`Different dbs don't affect each other`, async t => {
	const transaction1 = await smallIndexedDb(`db1`)
	const transaction2 = await smallIndexedDb(`db2`)

	await transaction1('readwrite', store => store.put('valuez', 'key1'))
	await transaction2('readwrite', store => store.put('VALUUUEEEEE', 'key1'))

	const value = await transaction1('readonly', store => store.get('key1'))

	t.equal(value, `valuez`)
})
