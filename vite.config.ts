import type { UserConfig } from 'vite'
import { loadEnv, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {
  AntDesignVueResolver,
  ElementPlusResolver
} from 'unplugin-vue-components/resolvers'
import path from 'path'

export default ({ mode }: UserConfig) => {
  const env = loadEnv(mode!, process.cwd())

  return defineConfig({
    plugins: [
      vue(),
      vueJsx(),
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [AntDesignVueResolver(), ElementPlusResolver()]
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    optimizeDeps: {
      include: ['vueuc']
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.tsx'),
        name: 'vuevt',
        fileName: format => `vuevt.${format}.js`
      },
      rollupOptions: {
        external: ['vue', 'ant-design-vue'],
        output: {
          globals: {
            vue: 'Vue',
            'ant-design-vue': 'antd',
            'element-plus': 'element'
          }
        }
      }
    }
  })
}
