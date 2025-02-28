const { build } = require('esbuild')
const { polyfillNode } = require('esbuild-plugin-polyfill-node');
const { rimraf } = require('rimraf')
const fs = require('fs')

const outdir = 'dist'

/**
 * @type {import('esbuild').BuildOptions}
 */
const options = {
    entryPoints: ['build/index.js'],
    bundle: true,
    outfile: `${outdir}/mqtt.js`,
    format: 'iife',
    platform: 'browser',
    globalName: 'mqtt',
    sourcemap: false, // this can be enabled while debugging, if we decide to keep this enabled we should also ship the `src` folder to npm
    define: {
        'global': 'window'
    },
    plugins: [
        polyfillNode({
            polyfills: [
                'readable-stream'
            ]
        }),
    ],
}

async function run() {
    const start = Date.now()
    await rimraf(outdir)
    await build(options)

    options.minify = true
    options.outfile = `${outdir}/mqtt.min.js`
    await build(options)


    options.outfile = `${outdir}/mqtt.esm.js`
    options.format = 'esm'

    await build(options)

    console.log(`Build time: ${Date.now() - start}ms`)
    console.log('Build output:')

    // log generated files with their size in KB
    const files = fs.readdirSync(outdir)
    for (const file of files) {
        const stat = fs.statSync(`${outdir}/${file}`)
        console.log(`- ${file} ${Math.round(stat.size / 1024 * 100) / 100} KB`)
    }
}

run().catch((e) => {
    console.error(e)
    process.exit(1)
})