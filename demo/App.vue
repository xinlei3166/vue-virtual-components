<template>
  <div style="padding: 24px">
    <a-card class="card">
      <VirtualTable
        class="content"
        row-key="id"
        bordered1
        :single-line="true"
        :columns="tableColumns"
        :loading="loading"
        :data-source="data"
        @change="onTableChange"
      ></VirtualTable>
      <a-table
        style="margin-top: 40px"
        class="content"
        row-key="id"
        bordered1
        :columns="tableColumns"
        :loading="loading"
        :data-source="data"
        :pagination="false"
        :scroll="{ y: 400 }"
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
import VirtualTable from '../src'
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
  const res = await getData({ pageNum: pagination.current, pageSize: 10 })
  loading.value = false
  if (res.code !== 0) return
  data.value = res.data
  pagination.total = res.total
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
