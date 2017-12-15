import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'

export default {
	name: `smallIndexedDbTest`,
	input: `./test.js`,
	output: {
		format: `iife`,
	},
	sourcemap: `inline`,
	plugins: [
		commonjs(),
		resolve({
			browser: true,
		}),
		builtins(),
		globals(),
	],
}
