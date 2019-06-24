import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss'
import { terser } from 'rollup-plugin-terser';
// import compiler from '@ampproject/rollup-plugin-closure-compiler';
// compilation_level: "ADVANCED",
// language_out: "ECMASCRIPT5_STRICT",
// assume_function_wrapper: true,
// isolation_mode: "IIFE"

let pkg = require('./package');
let preamble = `${pkg.name} v${pkg.version} ©${new Date().getFullYear()} Joel Ellis`

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
// const dev = true;

var postCSSPlugins = [
	require("postcss-import"),
	require("postcss-css-variables")]

!dev && (function () {
	postCSSPlugins = postCSSPlugins.concat([
		require("postcss-preset-env")({ stage: 4 }),
		require("autoprefixer")(),
		require("postcss-csso")
	])
})()


export default {
	input: ['src/main.js'],
	output: {
		sourcemap: dev,
		format: 'umd',
		name: 'app',
		dir: 'public/',
		sourcemapExcludeSources: true

	},
	plugins: [
		replace({
			'process.browser': true,
			'process.env.NODE_ENV': JSON.stringify(mode)
		}),
		// Compile .svelte files
		svelte({
			// enable run-time checks when not in production
			dev: dev,
			emitCss: true,
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration —
		// consult the documentation for details:
		// https://github.com/rollup/rollup-plugin-commonjs
		resolve(),
		commonjs(),

		// CSS via postcss
		// comment this out and it all works
		postcss({
			extract: true,
			plugins: postCSSPlugins
		}),
		// Babel
		!dev && babel(),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		// production && terser()
		!dev && terser({
			compress: {
				unsafe: true,
				passes: 2,
				keep_fargs: false,
				drop_console: true,
				arguments: true
			},
			mangle: {
				// properties: {
				// 	regex: /(^_)|(_$)/
				// },
				toplevel: true
			},
			output: {
				beautify: false,
				preamble: '/* ' + preamble + ' */',
				safari10: true,
				webkit: true
			}
			// TODO: nameCache: {}
		})
	]
};