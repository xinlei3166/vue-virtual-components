import path from 'path'
import { defineConfig } from 'vitepress'
import { demoblockPlugin, demoblockVitePlugin } from 'vitepress-theme-demoblock'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  lang: 'en-US',
  title: 'vue-virtual-components',
  description: 'Vue3 虚拟组件',

  appearance: false,
  lastUpdated: true,
  cleanUrls: true,

  base: process.env.BASE || '/',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]
  ],

  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },

    config: (md) => {
      md.use(demoblockPlugin, {
        customClass: 'demoblock-custom'
      })
    }
  },

  vite: {
    ssr: {
      noExternal: ['ant-design-vue', '@ant-design/icons-vue'],
    },
    plugins: [
      demoblockVitePlugin(),
      AutoImport({
        imports: ['vue', 'vue-router'],
        dts: false
      }),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: false
          })
        ]
      })
    ],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          modifyVars: {
            'primary-color': '#1677ff'
          },
          // additionalData: `@import "@/styles/theme.less";`
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname)
      }
    }
  },

  // vue: {},

  themeConfig: {
    outlineTitle: '本页目录',
    lastUpdatedText: '上次更新',
    logo: '/vue.svg',

    editLink: {
      pattern: 'https://github.com/xinlei3166/vue-virtual-components/edit/master/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/xinlei3166/vue-virtual-components' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present 君惜'
    },

    search: {
      provider: 'local'
      // provider: 'algolia',
      // options: {
      //   appId: 'X51HWTCQJJ',
      //   apiKey: 'ca20f15eb8a667898b65d13f4213ae3d',
      //   indexName: 'vitepress-demo'
      // }
    },

    // nav
    nav: [
      { text: '虚拟表格', link: '/table', activeMatch: '^/table' }
    ],

    // sidebar
    sidebar: {
      // '/table': getGuideSidebar()
    }
  }
})

function getGuideSidebar () {
  return [
    { text: 'What is vue-virtual-components?', link: '/' },
    { text: '@vue-virtual-components/antd-table', link: '/table' }
  ]
}

