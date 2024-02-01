<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const tabs: Array<Record<string, any>> = [
  {
    title: '虚拟表格',
    link: '/source-dev'
  }
]
const activeTab = ref(tabs[0].title)

const links = ['/source-dev', '/antd-style', '/element-style', '/antd-table']
const activePath = computed(() => router.currentRoute.value.path)
</script>

<template>
  <div class="app">
    <header class="header header-tab">
      <template v-for="(tab, index) in tabs" :key="tab">
        <span v-if="index !== 0">|</span>
        <a
          :class="['link', { active: activeTab === tab.title }]"
          :href="tab.link"
          @click="activeTab = tab.title"
        >
          {{ tab.title }}
        </a>
      </template>
    </header>
    <header class="header">
      <template v-for="(link, index) in links" :key="link">
        <span v-if="index !== 0">|</span>
        <a :class="['link', { active: activePath === link }]" :href="link">
          {{ link.replace('/', '') }}
        </a>
      </template>
    </header>
    <div class="main">
      <router-view />
    </div>
  </div>
</template>

<style lang="less" scoped>
.app {
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.link {
  font-size: 16px;
  color: #000;
  margin: 0 10px;
  &:hover {
    color: @primary-color;
  }

  &.active {
    color: @primary-color;
    font-weight: 500;
  }
}

.header-tab {
  background: #f3f4f6;
  padding: 10px;
  .link {
    font-size: 18px;
    &.active {
      text-decoration: underline;
    }
  }
}

.main {
  padding: 0 20px;
}
</style>
