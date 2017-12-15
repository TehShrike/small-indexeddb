const test = require('tape-promise/tape.js')
const smallIndexedDb = require('./index.js')

test(`Read empty key`, t => smallIndexedDb(`dummyDb`, 'dummyStore').then(store =>
	store.read([ `wat` ]).then(results => {
		t.ok(Array.isArray(results))
		t.equal(results.length, 1)
		t.equal(results[0], undefined)
	}))
)

test('Write values, then read them back', async t => {
	const store = await smallIndexedDb('someStore')

	await store.write([
		[ 'key1', 'value1' ],
		{ key: 'key2', value: 'value2' },
	])

	const [ value2 ] = await store.read([ 'key2' ])

	t.equal(value2, 'value2')

	const [ value1 ] = await store.read([ 'key1' ])

	t.equal(value1, 'value1')
})

test('Write some values, delete one, then read them', async t => {
	const store = await smallIndexedDb('someStore')

	await store.write([
		[ 'key1', 'value1' ],
		[ 'key2', 'value2' ],
		[ 'key3', 'value3' ],
	])

	await store.delete([ 'key2' ])

	const [ value1, value2, value3 ] = await store.read([ 'key1', 'key2', 'key3' ])

	t.equal(value1, 'value1')
	t.equal(value2, undefined)
	t.equal(value3, 'value3')
})

test(`Write some values, then clear 'em out`, async t => {
	const store = await smallIndexedDb('someStore')

	await store.write([
		[ 'key1', 'value1' ],
	])

	await store.clear()

	const [ value1 ] = await store.read([ 'key1' ])

	t.equal(value1, undefined)
})

test(`Write an object`, async t => {
	const store = await smallIndexedDb('someStore')

	await store.write([
		[ 'key1', { value1: true }],
	])

	const [ object ] = await store.read([ 'key1' ])

	t.deepEqual(object, { value1: true })
})

test(`Different dbs don't affect each other`, async t => {
	const store1 = await smallIndexedDb('store1')
	const store2 = await smallIndexedDb('store2')

	await store1.write([
		[ 'key1', 'valuez' ],
	])

	await store2.write([
		[ 'key1', 'VALUUUEEEEE' ],
	])

	const [ value ] = await store1.read([ 'key1' ])

	t.equal(value, 'valuez')
})
