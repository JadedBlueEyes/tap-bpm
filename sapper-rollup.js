import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import postcss from 'rollup-plugin-postcss'
import { terser } from 'rollup-plugin-terser';

import config from 'sapper/config/rollup.js';
// import compiler from '@ampproject/rollup-plugin-closure-compiler';
// compilation_level: "ADVANCED",
// language_out: "ECMASCRIPT5_STRICT",
// assume_function_wrapper: true,
// isolation_mode: "IIFE"

let pkg = require('./package');
let preamble = `${pkg.name} v${pkg.version} ©${new Date().getFullYear()} Joel Ellis`
let terserConf = {
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
		}

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
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

function moduleIt(ob) {
	ob["module"] = true;
	return ob
}
export default {
	client: {
	input: config.client.input(),
	output: config.client.output(),
	plugins: [

			replace({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
		// Compile .svelte files
		svelte({
			// enable run-time checks when not in !dev
			dev,
			hydratable: true,
			emitCss: true,
		}),
		// Babel
		// !dev && babel({extensions: ['.js', '.mjs', '.html', '.svelte'],
		// 		runtimeHelpers: true,
		// 		exclude: ['node_modules/@babel/**'],
		// 		presets: [
		// 			['@babel/preset-env', {targets: "last 2 years, >2%"}]
		// 		],
		// 		plugins: [
		// 			'@babel/plugin-syntax-dynamic-import',
		// 			['@babel/plugin-transform-runtime', {
		// 				useESModules: true
		// 			}]
		// 		]
		// }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration —
		// consult the documentation for details:
		// https://github.com/rollup/rollup-plugin-commonjs
		resolve(),
		commonjs(),

		// CSS via postcss
		// postcss({
		// 	// extract: true,
		// 	plugins: postCSSPlugins
		// }),

		// If we're building for !dev (npm run build
		// instead of npm run dev), minify
		// !dev && terser()
		!dev && terser(moduleIt(terserConf))
	]
},
server: {
		input: config.server.input(),
		output: config.server.output(),
		plugins: [
			replace({
				'process.browser': false,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
			svelte({
				generate: 'ssr',
				dev
			}),
			resolve(),
			commonjs(),
			terser(terserConf)
		],
		external: Object.keys(pkg.dependencies).concat(
			require('module').builtinModules || Object.keys(process.binding('natives'))
		),
	},

	serviceworker: {
		input: config.serviceworker.input(),
		output: config.serviceworker.output(),
		plugins: [
			resolve(),
			replace({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
			commonjs(),
			!dev && terser(terserConf)
		]
	}
};