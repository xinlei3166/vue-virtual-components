<script setup lang="ts">
import { ref, reactive, computed, unref, onBeforeMount } from 'vue'
import { Table } from '../../../packages/antd-table/src/'
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
  console.log(data.value)
})

async function init() {
  loading.value = true
  setTimeout(async () => {
    const res = await getList({
      params: { page: pagination.current, pageSize: 200 }
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
  console.log(data.value)
  selectedRowKeys.value = []
}

async function onTableChange(value: any) {
  console.log('onTableChange', value)
}

function onEdit(record: Record<string, any>) {
  window.open('https://baidu.com')
}

function onPreview(record: Record<string, any>) {
  window.open('https://baidu.com')
}

const selectedRowKeys = ref([1])
const rowSelection = computed(() => ({
  onChange: (_selectedRowKeys, selectedRows) => {
    selectedRowKeys.value = _selectedRowKeys
    console.group('onChange')
    console.log('selectedRowKeys', _selectedRowKeys)
    console.log('selectedRows', selectedRows)
    console.groupEnd()
  },
  onSelect: (record, selected, selectedRows, nativeEvent) => {
    console.group('onSelect')
    console.log('record', record)
    console.log('selected', selected)
    console.log('selectedRows', selectedRows)
    console.log('nativeEvent', nativeEvent)
    console.groupEnd()
  },
  onSelectAll: (selected, selectedRows, changeRows) => {
    console.group('onSelectAll')
    console.log('selected', selected)
    console.log('selectedRows', selectedRows)
    console.log('changeRows', changeRows)
    console.groupEnd()
  },
  onSelectInvert: selectedRows => {
    console.group('onSelectInvert')
    console.log('selectedRows', selectedRows)
    console.groupEnd()
  },
  onSelectNone: () => {
    console.group('onSelectNone')
    console.log('onSelectNone')
    console.groupEnd()
  },
  getCheckboxProps: (record: Record<string, any> = {}) => {
    return {
      disabled: record.id === 2,
      name: record.name
    }
  },
  hideSelectAll: false,
  selectedRowKeys: unref(selectedRowKeys),
  selections: [
    Table.SELECTION_ALL,
    Table.SELECTION_INVERT,
    Table.SELECTION_NONE,
    {
      key: 'odd',
      text: 'Select Odd Row',
      onSelect: changableRowKeys => {
        let newSelectedRowKeys = []
        newSelectedRowKeys = changableRowKeys.filter((_key, index) => {
          if (index % 2 !== 0) {
            return false
          }
          return true
        })
        selectedRowKeys.value = newSelectedRowKeys
      }
    },
    {
      key: 'even',
      text: 'Select Even Row',
      onSelect: changableRowKeys => {
        let newSelectedRowKeys = []
        newSelectedRowKeys = changableRowKeys.filter((_key, index) => {
          if (index % 2 !== 0) {
            return true
          }
          return false
        })
        selectedRowKeys.value = newSelectedRowKeys
      }
    }
  ]
}))
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
    <virtual-table
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
      :row-selection="rowSelection"
      show-sorter-tooltip
      @change="onTableChange"
    >
      <template #gender="{ record }">
        <span>{{ record.gender === '1' ? '男' : '女' }}</span>
      </template>
      <template #operation="{ record }">
        <span class="btn" @click="onEdit(record)">编辑</span>
        <span class="btn" @click="onPreview(record)">预览</span>
      </template>
    </virtual-table>
  </a-card>
</template>

<style scoped lang="less">
.btn {
  color: @primary-color;
  margin-right: 10px;
  cursor: pointer;
}
</style>
