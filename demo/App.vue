<template>
  <div style="padding: 24px">
    <a-card class="card">
      <VirtualTableElement
        style="margin-bottom: 60px"
        class="content"
        table-style="element"
        row-key="id"
        bordered1
        :columns="tableColumns"
        :loading="loading"
        :data="data"
        :scroll="{ x: 'max-content', y: 400 }"
        @change="onTableChange"
      >
        <template #operation="text, record">
          <span class="btn" @click="onEdit(record)">编辑</span>
          <span class="btn" @click="onPreview(record)">预览</span>
        </template>
      </VirtualTableElement>
      <AntdVirtualTable
        class="content"
        row-key="id"
        bordered1
        :columns="tableColumns"
        :loading="loading"
        :data="data"
        :scroll="{ x: 'max-content', y: 400 }"
        @change="onTableChange"
      >
        <template #operation="text, record">
          <span class="btn" @click="onEdit(record)">编辑</span>
          <span class="btn" @click="onPreview(record)">预览</span>
        </template>
      </AntdVirtualTable>
      <a-table
        style="margin-top: 40px"
        class="content"
        row-key="id"
        bordered1
        :columns="tableColumns"
        :loading="loading"
        :data-source="data"
        :pagination="false"
        :scroll="{ x: 'max-content', y: 400 }"
        @change="onTableChange"
      >
        <template #operation="text, record">
          <span class="btn" @click="onEdit(record)">编辑</span>
          <span class="btn" @click="onPreview(record)">预览</span>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onBeforeMount } from 'vue'
import AntdVirtualTable from '../src/antd'
import VirtualTableElement from '../src/element'
import { tableColumns } from './columns'
import { getData } from './api'

const loading = ref(false)
const data = ref<any>([])
const pagination = reactive({
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
    const res = await getData({ pageNum: pagination.current, pageSize: 20 })
    loading.value = false
    if (res.code !== 0) return
    data.value = res.data
    pagination.total = res.total
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

function onEdit() {
  window.open('https://baidu.com')
}

function onPreview() {
  window.open('https://baidu.com')
}
</script>

<style lang="less" scoped>
.btn {
  color: #1890ff;
  margin-right: 10px;
  cursor: pointer;
}
</style>
