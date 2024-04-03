import { defineBuildConfig, BuildEntry } from 'unbuild'
import path from 'path'
import fs from 'node:fs'

// import path from 'node:path'
// import { findFiles, getDirname } from '@vue-virtual-components/utils'
// const __dirname = getDirname(import.meta.url)
// const dirs = findFiles({
//   src: path.resolve(__dirname, 'src'),
//   exclude: ['styles', 'icons'],
//   filetype: 'dir'
// })

export default defineBuildConfig({
  entries: [
    {
      input: 'src/index',
      name: 'index'
    }
    // ...dirs.map(dir => ({
    //   builder: 'mkdist',
    //   format: 'esm',
    //   pattern: '**/!(*.stories).{js,jsx,ts,tsx}',
    //   // loaders: ['vue'],
    //   input: `src/${dir}/`,
    //   outDir: `dist/${dir}/`
    // }))
  ],
  clean: false,
  declaration: true,
  failOnWarn: false,
  externals: [],
  rollup: {
    // emitCJS: true,
    esbuild: {
      jsx: 'transform', // 'transform' | 'preserve' | 'automatic'
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
      jsxImportSource: 'vue',
      drop: ['console', 'debugger']
    }
  },
  hooks: {
    'rollup:options'(_ctx, options) {
      if (Array.isArray(options.plugins)) {
        options.plugins.push({
          name: 'rollup-ah-plugin',
          enforce: 'pre',
          async transform(code, id) {
            if (id.endsWith('.tsx')) {
              code = `import { h, Fragment } from "vue";\n${code}`
              return { code, map: null }
            }
          }
        })
      }
    }
  }
})
