export default {
  lang: 'en-US',
  title: 'vue-virtual-table',
  description: 'vue-virtual-table',

  themeConfig: {
    repo: 'xinlei3166/vue-virtual-table',
    docsDir: 'docs',
    docsBranch: 'main',
    editLinks: true,
    editLinkText: 'Edit this page on GitHub',
    lastUpdated: 'Last Updated',

    nav: [
      { text: 'Guide', link: '/', activeMatch: '^/' }
    ],

    sidebar: {
      '/': getGuideSidebar()
    }
  }
}

function getGuideSidebar() {
  return [
    { text: 'What is yunque?', link: '/' }
  ]
}
