<script setup lang="ts">
import { ref, reactive, computed, onBeforeMount } from 'vue'
import { getList } from '@/api'
import { tableColumns } from './columns'

const loading = ref(false)
const pagination = reactive<Record<string, any>>({
  size: 'small',
  current: 1,
  defaultCurrent: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total: number | string) => `共${total}条`,
  showLessItems: true,
  showQuickJumper: true,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '30', '50', '100']
})
const data = ref([])

onBeforeMount(async () => {
  await init()
})

async function onSearch() {
  pagination.current = 1
  await init()
}

async function init() {
  loading.value = true
  const res = await getList({
    params: { page: pagination.current, pageSize: 20 }
  })
  loading.value = false
  if (res.code !== 0) return
  data.value = res.data.list
  pagination.total = res.data.total
}

async function onTableChange(pag: Record<string, any>) {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  await init()
}

function onEdit(record: Record<string, any>) {
  window.open('https://baidu.com')
}

function onPreview(record: Record<string, any>) {
  window.open('https://baidu.com')
}
</script>

<template>
  <a-card class="card">
    <a-button
      type="primary"
      style="margin-bottom: 20px"
      :loading="loading"
      @click="onSearch"
    >
      查询
    </a-button>
    <a-table
      class="content"
      row-key="id"
      bordered
      :row-class-name="(record, index) => `row${index}`"
      :columns="tableColumns"
      :loading="loading"
      :data-source="[]"
      :pagination="false"
      :scroll="{
        x: 'max-content',
        y: 'calc(100vh - 94px - 88px - 58px - 56px)'
      }"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'operation'">
          <span class="btn" @click="onEdit(record)">编辑</span>
          <span class="btn" @click="onPreview(record)">预览</span>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<style lang="less" scoped>
.btn {
  color: @primary-color;
  margin-right: 10px;
  cursor: pointer;
}
</style>
