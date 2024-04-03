---
layout: home

title: vue-virtual-components
titleTemplate: Vue3 虚拟组件。

hero:
  name: Vue3 虚拟组件
  text: TypeScript & Vue3
  tagline: vue-virtual-components, 满足前端日益复杂的功能和海量数据量的展示.
  image:
    src: /vue.svg
    alt: vue-virtual-components  
  actions:
    - theme: brand
      text: Get Started
      link: /table/
    - theme: alt
      text: View on GitHub
      link: https://github.com/xinlei3166/vue-virtual-components

features:
  - icon: ⚡️
    title: 虚拟 Dom
    details: 使用虚拟 Dom, 支持海量数据.  
  - icon: 📝
    title: 虚拟表格
    details: ant-design-vue风格虚拟表格.
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #1677ff 30%, #42b883);

  /*--vp-home-hero-image-background-image: linear-gradient(-45deg, #1677ff 50%, #42b883 50%);*/
  --vp-home-hero-image-background-image: linear-gradient(-45deg, #1677ff 30%, #42b883 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}

.VPHomeHero .VPImage {
  width: 320px
}
</style>
