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
	const store = await smallIndexedDb('whatever', 'someStore')

	await store.write([
		[ 'key1', 'value1' ],
		{ key: 'key2', value: 'value2' },
	])

	const [ value2 ] = await store.read([ 'key2' ])

	t.equal(value2, 'value2')

	const [ value1 ] = await store.read([ 'key1' ])

	t.equal(value1, 'value1')
})
