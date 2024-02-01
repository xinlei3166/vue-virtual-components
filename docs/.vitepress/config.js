export default {
  lang: 'en-US',
  title: 'yunque',
  description: 'Simple scaffolding tools.',

  themeConfig: {
    repo: 'yunquejs/yunque',
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
    { text: 'What is yunque?', link: '/' },
    { text: '@yunquejs/cli', link: '/cli' },
    { text: '@yunquejs/release', link: '/release' },
    { text: '@yunquejs/fabric', link: '/fabric' },
  ]
}

