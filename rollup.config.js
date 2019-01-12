import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

export default {
	input: `./test.js`,
	output: {
		name: `smallIndexedDbTest`,
		format: `iife`,
		sourcemap: `inline`,
	},
	plugins: [
		commonjs(),
		resolve({
			browser: true,
		}),
	],
}
