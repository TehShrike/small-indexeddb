import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

export default {
	input: `./index.js`,
	output: {
		file: `bundle.js`,
		format: `esm`,
		sourcemap: true,
	},
	plugins: [
		commonjs(),
		resolve({
			browser: true,
		}),
	],
}
