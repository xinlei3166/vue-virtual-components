---
layout: doc
---
# 虚拟表格

`ant-design-vue` 风格虚拟表格。

## 安装

::: code-group

```bash [npm]
$ npm install @vue-virtual-components/antd-table
```

```bash [pnpm]
$ pnpm add @vue-virtual-components/antd-table
```

```bash [yarn]
$ yarn add @vue-virtual-components/antd-table
```
:::

## 基本用法

简单的表格，最后一列是各种操作。

:::demo

```vue
<script setup lang="ts">
import { ref, reactive, computed, unref, onBeforeMount } from 'vue'
import { getList } from '@/api'

// tableColumns
const tableColumns: any[] = [
  {
    title: 'ID',
    key: 'id',
    dataIndex: 'id',
    width: 64,
    fixed: 'left'
  },
  {
    title: '姓名',
    key: 'name',
    dataIndex: 'name',
    width: 80,
    fixed: 'left'
  },
  {
    title: '年龄',
    key: 'age',
    dataIndex: 'age',
    width: 80
  },
  {
    title: '性别',
    key: 'gender',
    width: 80
  },
  {
    title: '喜欢',
    key: 'hobby1',
    dataIndex: 'hobby',
    width: 200
  },
  {
    title: '爱好',
    key: 'hobby2',
    dataIndex: 'hobby',
    width: 200
  },
  {
    title: '更新时间',
    key: 'updateTime',
    dataIndex: 'updateTime'
  },
  {
    title: '操作',
    key: 'operation',
    dataIndex: 'operation',
    width: 120,
    fixed: 'right'
  }
]

const pageSize = ref(200)
const loading = ref(false)
const data = ref<any>([])

onBeforeMount(async () => {
  await init()
})

async function init() {
  loading.value = true
  setTimeout(async () => {
    const res = await getList({
      params: { page: 1, pageSize: pageSize.value }
    })
    loading.value = false
    if (res.code !== 0) return
    data.value = res.data.list
  }, 2000)
}

async function onSearch() {
  await init()
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
</script>

<template>
  <div style="margin-bottom: 20px;display: flex;align-items: center;">
    <span>设置数据行数</span>
    <a-input-number style="margin: 0 16px" v-model:value="pageSize" :min="1" :max="10000" />
    <a-button 
      type="primary"
  		:loading="loading"
    	@click="onSearch"
    >
    查询
  </a-button>
  </div>
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
    :scroll="{ x: 'max-content', y: 400 }"
    @change="onTableChange"
  >
    <template #gender="{ record }">
      <span>{{ record.gender === '1' ? '男' : '女' }}</span>
    </template>
    <template #operation="{ record }">
      <a-button type="link" class="a-text-btn" @click="onEdit(record)">编辑</a-button>
      <a-button type="link" class="a-text-btn" @click="onPreview(record)">预览</a-button>
    </template>
  </virtual-table>
</template>

<style scoped lang="less">
// text btn style
.a-text-btn {
  padding: 0;
  border: none;
}

.a-text-btn + .a-text-btn {
  margin-left: 8px;
}
</style>
```

:::

## 完整用法

复杂的表格，展示表格目前支持的各种用法。

:::demo

```vue
<script setup lang="ts">
import { ref, reactive, computed, unref, onBeforeMount } from 'vue'
import message from 'ant-design-vue/es/message'
import 'ant-design-vue/es/message/style'
import { Table } from '@vue-virtual-components/antd-table' 
import { getList } from '@/api'

// tableColumns
const tableColumns: any[] = [
  {
    title: 'ID',
    key: 'id',
    dataIndex: 'id',
    width: 64,
    fixed: 'left'
  },
  {
    title: '姓名',
    key: 'name',
    dataIndex: 'name',
    width: 80,
    fixed: 'left',
    sorter: true
  },
  {
    title: '年龄',
    key: 'age',
    dataIndex: 'age',
    width: 80,
    sorter: true
  },
  {
    title: '性别',
    key: 'gender',
    width: 80,
    sorter: {
      compare: (a, b) => a.gender - b.gender
    }
  },
  {
    title: '喜欢',
    key: 'hobby1',
    dataIndex: 'hobby',
    width: 200,
    sorter: {
      compare: (a, b) => a.age - b.age
    }
  },
  {
    title: '爱好',
    key: 'hobby2',
    dataIndex: 'hobby',
    width: 200
  },
  {
    title: '更新时间',
    key: 'updateTime',
    dataIndex: 'updateTime'
  },
  {
    title: '操作',
    key: 'operation',
    dataIndex: 'operation',
    width: 120,
    fixed: 'right'
  }
]

const pageSize = ref(200)
const loading = ref(false)
const data = ref<any>([])

onBeforeMount(async () => {
  await init()
})

async function init() {
  loading.value = true
  setTimeout(async () => {
    const res = await getList({
      params: { page: 1, pageSize: pageSize.value }
    })
    loading.value = false
    if (res.code !== 0) return
    data.value = res.data.list
  }, 2000)
}

async function onSearch() {
  await init()
  selectedRowKeys.value = []
}

async function onTableChange(value: any) {
  if (value.sorter?.sorter === true) {
    message.info(`远程排序：${value.sorter?.columnKey}`)
  }
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
  <div style="margin-bottom: 20px;display: flex;align-items: center;">
    <span v-if="false">设置数据行数</span>
    <a-input-number v-if="false" style="margin: 0 16px" v-model:value="pageSize" :min="1" :max="10000" />
    <a-button 
      type="primary"
  		:loading="loading"
    	@click="onSearch"
    >
    查询
  </a-button>
  </div>
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
    :scroll="{ x: 'max-content', y: 400 }"
    :row-selection="rowSelection"
    show-sorter-tooltip
    @change="onTableChange"
  >
    <template #gender="{ record }">
      <span>{{ record.gender === '1' ? '男' : '女' }}</span>
    </template>
    <template #operation="{ record }">
      <a-button type="link" class="a-text-btn" @click="onEdit(record)">编辑</a-button>
      <a-button type="link" class="a-text-btn" @click="onPreview(record)">预览</a-button>
    </template>
  </virtual-table>
</template>

<style scoped lang="less">
// text btn style
.a-text-btn {
  padding: 0;
  border: none;
}

.a-text-btn + .a-text-btn {
  margin-left: 8px;
}
</style>
```

:::

## API

### Table

| 参数              | 说明                                                         | 类型                                                         | 默认值                                                       |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| tableStyle        | 表格风格                                                     | `antd \| antd2`                                              | antd                                                         |
| bordered          | 是否展示外边框和列边框                                       | boolean                                                      | false                                                        |
| columns           | 表格列的配置描述，具体项见[下表](#column)                    | array                                                        | -                                                            |
| data              | 数据数组                                                     | object[]                                                     | []                                                           |
| getPopupContainer | 设置表格内各类浮层的渲染节点，如筛选菜单                     | (triggerNode) => HTMLElement                                 | -                                                            |
| loading           | 页面是否加载中                                               | boolean                                                      | false                                                        |
| locale            | 默认文案设置，目前包括筛选、排序、空数据文案                 | object                                                       | emptyText: '暂无数据', <br />selectionNone: '清空所有', <br />selectionInvert: '反选当页', <br />selectionAll: '全选所有', <br />triggerDesc: '点击降序', <br />triggerAsc: '点击升序', <br />cancelSort: '取消排序' |
| rowClassName      | 表格行的类名                                                 | `string \| Function(record, index):string`                   | -                                                            |
| rowKey            | 表格行 key 的取值，可以是字符串或一个函数                    | `string \| Function(record):string`                          | 'id'                                                         |
| rowSelection      | 列表项是否可选择，[配置项](#rowselection)                    | object                                                       | -                                                            |
| scroll            | 表格是否可滚动，也可以指定滚动区域的宽、高，[配置项](#scroll) | object                                                       | -                                                            |
| showSorterTooltip | 表头是否显示下一次排序的 tooltip 提示。当参数类型为对象时，将被设置为 Tooltip 的属性 | boolean `\|` [Tooltip props](https://antdv.com/components/tooltip/) | true                                                         |
| size              | 表格大小                                                     | `default \| middle \| small`                                 | default                                                      |
| tableLayout       | 表格元素的 [table-layout](https://developer.mozilla.org/zh-CN/docs/Web/CSS/table-layout) 属性，设为 `fixed` 表示内容不会影响列的布局 | `auto \| fixed`                                              | fixed                                                        |

### 事件

| 参数   | 说明           | 回调参数                                |
| ------ | -------------- | --------------------------------------- |
| change | 排序变化时触发 | Function({ currentDataSource, sorter }) |

### Column

列描述数据对象，是 columns 中的一项，Column 使用相同的 API。

| 参数              | 说明                                                         | 类型                                                         | 默认值                      |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | --------------------------- |
| headerSlot        | 个性化头部单元格                                             | v-slot:[headerSlot]="{ column }"                             | -                           |
| slot              | 个性化单元格                                                 | v-slot:[slot]="{text, record, index, column}"                | 取值优先级：`slot \|\| key` |
| align             | 设置列的对齐方式                                             | `left \| right \| center`                                    | left                        |
| colSpan           | 表头列的colspan                                              | number                                                       | -                           |
| rowSpan           | 表头列的rowspan                                              | number                                                       | -                           |
| customHeaderCell  | 设置头部单元格属性                                           | Function(column)                                             | -                           |
| dataIndex         | 列数据在数据项中对应的路径，支持通过数组查询嵌套路径         | `string \| string[] \| number`                               | -                           |
| defaultSortOrder  | 默认排序顺序                                                 | `ascend \| descend \| false`                                 | -                           |
| fixed             | 列是否固定                                                   | `left \| right`                                              | -                           |
| key               | Vue 需要的 key                                               | string                                                       | -                           |
| minWidth          | 列最小宽度                                                   | number                                                       | -                           |
| showSorterTooltip | 表头显示下一次排序的 tooltip 提示, 覆盖 table 中 `showSorterTooltip` | boolean `\|` [Tooltip props](https://antdv.com/components/tooltip/#API) | -                           |
| sorter            | 排序函数，本地排序使用一个函数(参考 [Array.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) 的 compareFunction)，需要服务端排序可设为 true | `Function \| boolean`                                        | -                           |
| sortOrder         | 排序的受控属性，外界可用此控制列的排序，可设置为 `'ascend'` `'descend'` `false` | `boolean \| string`                                          | -                           |
| title             | 列头显示文字                                                 | string                                                       | -                           |
| width             | 列宽度                                                       | number                                                       | -                           |

### RowSelection

选择功能的配置。

| 参数             | 说明                                                         | 类型                                                  | 默认值   |
| ---------------- | ------------------------------------------------------------ | ----------------------------------------------------- | -------- |
| fixed            | 把选择框列固定在左边                                         | boolean                                               | -        |
| getCheckboxProps | 选择框的默认属性配置                                         | Function(record)                                      | -        |
| hideSelectAll    | 隐藏全选勾选框与自定义选择项                                 | boolean                                               | false    |
| selectedRowKeys  | 指定选中项的 key 数组，需要和 onChange 进行配合              | string[]                                              | []       |
| selections       | 自定义选择项 [配置项](#selection), 设为 `true` 时使用默认选择项 | `object[] \| boolean`                                 | true     |
| type             | 多选/单选，`checkbox` or `radio`                             | string                                                | checkbox |
| onChange         | 选中项发生变化时的回调                                       | Function(selectedRowKeys, selectedRows)               | -        |
| onSelect         | 用户手动选择/取消选择某列的回调                              | Function(record, selected, selectedRows, nativeEvent) | -        |
| onSelectAll      | 用户手动选择/取消选择所有列的回调                            | Function(selected, selectedRows, changeRows)          | -        |
| onSelectInvert   | 用户手动选择反选的回调                                       | Function(selectedRows)                                | -        |
| onSelectNone     | 用户清空选择的回调                                           | Function()                                            | -        |

### Scroll

| 参数 | 说明                                                         | 类型                        | 默认值 |
| ---- | ------------------------------------------------------------ | --------------------------- | ------ |
| x    | 设置横向滚动，也可用于指定滚动区域的宽，可以设置为像素值，百分比，true 和 ['max-content'](https://developer.mozilla.org/zh-CN/docs/Web/CSS/width#max-content) | `string \| number \| true ` | -      |
| y    | 设置纵向滚动，也可用于指定滚动区域的高，可以设置为像素值     | `string \| number`          | -      |

### Selection

自定义选择配置项

| 参数     | 说明                     | 类型                        | 默认值 |
| -------- | ------------------------ | --------------------------- | ------ |
| key      | Vue 需要的 key，建议设置 | string                      | -      |
| text     | 选择项显示的文字         | `string \| VNode`           | -      |
| onSelect | 选择项点击回调           | Function(changeableRowKeys) | -      |



