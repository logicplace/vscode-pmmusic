const esbuild = require('esbuild');
const fs = require('fs/promises');
const path = require('path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

async function main() {
	const ctx = await esbuild.context({
		entryPoints: ['src/extension.ts'],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'warning',
		plugins: [
			replaceBinding,
			/* add to the end of plugins array */
			esbuildProblemMatcherPlugin
		]
	});
	if (watch) {
		await ctx.watch();
	} else {
		await ctx.rebuild();
		await ctx.dispose();
	}
}

/**
 * @type {import('esbuild').Plugin}
 */
const replaceBinding = {
	name: 'replace-binding',

	setup(build) {
		build.onLoad({ filter: /index.js$/ }, async args => {
			const source = await fs.readFile(args.path, "utf8");
			const contents = source.replace(/require\((['"])bindings\1\)\((['"])(.*?)\2\)/g, (_, q1, q2, s) => {
				const mr = (
					'require("path").join('
					+'require("vscode").extensions.getExtension("LogicPlace.pmmusic").extensionPath,'
					+'"'+path.dirname(args.path).replace(/.*node_modules/, "node_modules").replace(/\\/g, "/")+'"'
					+')'
				)
				const res = `{bindings:${q2}${s}${q2}, module_root: ${mr}}`
				return `require(${q1}bindings${q1})(${res})`
			})
			return { contents, loader: "js" }
		})
	}
};

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd(result => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				if (location == null) return;
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	}
};

main().catch(e => {
	console.error(e);
	process.exit(1);
});
