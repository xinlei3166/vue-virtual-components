import { loadEnv, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'
import { createHtmlPlugin } from 'vite-plugin-html'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

export default ({ mode, command }: any) => {
  console.log('mode', mode)
  // const envDir = process.cwd()
  const envDir = path.resolve(process.cwd(), 'env')
  const env = loadEnv(mode, envDir)
  console.log('env', env)

  // @ts-ignore
  return defineConfig({
    define: {
      __APP_TITLE__: JSON.stringify(env.VITE_APP_TITLE),
      __DYNAMIC_MENU__: env.VITE_DYNAMIC_MENU,
      __PORTAL_API_VERSION__: JSON.stringify(env.VITE_PORTAL_API_VERSION)
    },
    envDir,
    optimizeDeps: {
      include: ['await-to-js', 'jquery']
    },
    build: {
      outDir: env.VITE_OUTDIR || 'dist'
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          modifyVars: {
            'primary-color': '#1677ff'
          },
          additionalData: `@import "@/styles/theme.less";`
        }
      }
    },
    plugins: [
      vue(),
      jsx(),
      AutoImport({
        imports: ['vue', 'vue-router'],
        dts: false
      }),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: 'less'
          })
        ]
      }),
      createHtmlPlugin({
        // inject: {
        //   data: {
        //     title: 'title',
        //     injectScript: `<script src="./inject.js"></script>`
        //   }
        // }
      })
    ],
    base: env.VITE_APP_BASE || '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        vue: 'vue/dist/vue.esm-bundler.js'
      },
      extensions: [
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.mjs',
        '.vue',
        '.json',
        '.less',
        '.scss',
        '.css'
      ]
    },
    esbuild: {
      drop: command === 'build' ? ['console', 'debugger'] : []
    },
    server: {
      // proxy: {
      //   [env.VITE_API_URL]: {
      //     target: env.VITE_PROXY_TARGET,
      //     changeOrigin: true,
      //     secure: false,
      //     bypass: (req, res, options) => {
      //       const reqUrl = options?.rewrite!(req.url as string) || ''
      //       const targetUrl = options.target as string
      //       const proxyUrl = new URL(reqUrl, targetUrl)?.href || ''
      //       res.setHeader('x-req-proxy-url', proxyUrl)
      //       console.log(reqUrl, ' --> ', proxyUrl)
      //     },
      //     rewrite: path => path
      //   }
      // }
    }
  })
}
