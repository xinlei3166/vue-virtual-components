<script setup lang="ts">
import { ref, reactive, computed, onBeforeMount } from 'vue'
import { Table } from '../../../packages/table/src/'
import { tableColumns } from './columns'
import { getList } from '@/api'

const loading = ref(false)
const data = ref<any>([])
const pagination = reactive<Record<string, any>>({
  size: 'small',
  current: 1,
  defaultCurrent: 1,
  pageSize: 20,
  total: 0,
  showTotal: (total: number | string) => `共${total}条`,
  showLessItems: true,
  showQuickJumper: true,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '30', '40', '50']
})

onBeforeMount(async () => {
  await init()
})

async function init() {
  loading.value = true
  setTimeout(async () => {
    const res = await getList({
      params: { page: pagination.current, pageSize: 20 }
    })
    loading.value = false
    if (res.code !== 0) return
    data.value = res.data.list
    pagination.total = res.data.total
  }, 2000)
}

async function onSearch() {
  pagination.current = 1
  await init()
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
    <Table
      class="content"
      :bordered="false"
      row-key="id"
      :row-class-name="(record, index) => `row-${index}`"
      table-style="antd"
      table-layout="auto"
      :columns="tableColumns"
      :loading="loading"
      :data="data"
      :scroll="{ x: 'max-content', y: 600 }"
      @change="onTableChange"
    >
      <template #gender="{ record }">
        <span>{{ record.gender === '1' ? '男' : '女' }}</span>
      </template>
      <template #operation="{ record }">
        <span class="btn" @click="onEdit(record)">编辑</span>
        <span class="btn" @click="onPreview(record)">预览</span>
      </template>
    </Table>
  </a-card>
</template>

<style scoped lang="less">
.btn {
  color: @primary-color;
  margin-right: 10px;
  cursor: pointer;
}
</style>
