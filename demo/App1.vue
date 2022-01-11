<template>
  <a-card class="card">
    <a-table
      class="content"
      row-key="id"
      :columns="tableColumns"
      :loading="loading"
      :data-source="data"
      :pagination="false"
      :scroll="{ y: 'calc(100vh - 94px - 88px - 58px - 56px)' }"
      @change="onTableChange"
    >
      <template #operation="text, record">
        <span class="btn" @click="onEdit(record)">编辑</span>
        <span class="btn" @click="onPreview(record)">预览</span>
      </template>
    </a-table>
  </a-card>
</template>

<script lang="ts">
import { defineComponent, computed, onBeforeMount } from 'vue'
import { Pagination } from '@/interface'
import { usePagination } from '@/hooks/pagination'
import { getData } from '@/api'
import { tableColumns } from './columns'

export default defineComponent({
  setup() {
    const { loading, data, pagination } = usePagination()

    onBeforeMount(async () => {
      await init()
    })

    async function init() {
      loading.value = true
      const res = await getData({ pageNum: pagination.current, pageSize: 100 })
      loading.value = false
      if (res.code !== 0) return
      data.value = res.data
      pagination.total = res.total
    }

    async function onSearch() {
      pagination.current = 1
      await init()
    }

    async function onTableChange(pag: Pagination) {
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

    return { tableColumns, loading, data, pagination, onSearch, onTableChange, onEdit, onPreview }
  }
})
</script>

<style lang="less" scoped>
.btn {
  color: #1890ff;
  margin-right: 10px;
  cursor: pointer;
}
</style>
