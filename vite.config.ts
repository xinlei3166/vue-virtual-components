import { loadEnv, defineConfig, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'

export default ({ mode }: UserConfig) => {
  const env = loadEnv(mode!, process.cwd())

  return defineConfig({
    plugins: [vue(), vueJsx()],
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
        name: 'vue-virtual-table',
        fileName: format => `vue-virtual-table.${format}.js`
      },
      rollupOptions: {
        external: ['vue', 'ant-design-vue'],
        output: {
          globals: {
            vue: 'Vue',
            'ant-design-vue': 'antd'
          }
        }
      }
    }
  })
}
