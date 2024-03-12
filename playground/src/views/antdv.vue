<script setup lang="ts">
import { ref, reactive, computed, unref, onBeforeMount } from 'vue'
import { getList } from '@/api'
import { tableColumns } from './columns'
import { Checkbox, Radio, Table } from 'ant-design-vue'

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

async function onTableChange(
  pag: Record<string, any>,
  filters,
  sorter,
  { currentDataSource }
) {
  if (
    pagination.current === pag.current &&
    pagination.pageSize === pag.pageSize
  )
    return
  console.log('sorter', sorter)
  console.log('currentDataSource', currentDataSource)
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

const checked = ref(false)
const onCheckedChange = (a, b) => {
  checked.value = !checked.value
  console.log(a, b)
}

const selectedRowKeys = ref([1])
const rowSelection = computed(() => ({
  // type: 'radio',
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
    <a-table
      class="content"
      row-key="id"
      :bordered="false"
      :row-class-name="(record, index) => `row${index}`"
      :columns="tableColumns"
      :loading="loading"
      :data-source="data"
      :pagination="false"
      :scroll="{
        x: 'max-content',
        y: 'calc(100vh - 94px - 88px - 58px - 56px)'
      }"
      :row-selection="rowSelection"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'gender'">
          <span>{{ record.gender === '1' ? '男' : '女' }}</span>
        </template>
        <template v-if="column.key === 'operation'">
          <!--          <Checkbox :checked="checked" @change="onCheckedChange" />-->
          <!--          <Radio :checked="checked" @change="onCheckedChange" />-->
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
