<template>
    <el-scrollbar ref="scrollbar" class="chart-table-scrollbar" style="width: 100%;margin-top: 10px;border: 1px solid #EBEEF5;">
      <div class="chart-table detail-table-wapper el-table detail-table" style="height: 360px;margin: 0 !important;border: none !important;" :style="{'min-width': tableWidth + 'px'}" v-loading="loading">
        <table class="el-table__header fl" style="width: 124px;position: absolute;top: -2px; left: -2px;">
          <thead>
            <tr class="detail-header-row">
              <th>
                <div class="cell">
                  {{columns.length && columns[0].label[i18n]}}
                </div>
              </th>
            </tr>
          </thead>
        </table>
        <table cellspacing="0" cellpadding="0" border="0" class="el-table__header" style="width: 100%;padding-left: 120px;">
          <colgroup>
            <col v-for="(col, idx) in columns1" :key="idx" :style="{'min-width': parseInt(col.width || 90) + 'px', width: parseInt(col.width || 90) + 'px'}">
          </colgroup>
          <thead>
            <tr class="detail-header-row">
              <th v-for="(col, idx) in columns1" :key="idx" @click="handleSort(col)" :class="{'is-sortable': col.sortable, [sortType]: sortColumn === col.prop}">
                <div class="cell">
                <span class="one-line table-head" :class="{sortable: col.sortable, hasTooltip: col.tooltip}">
                  {{col.label[i18n]}}
                </span>
                <el-tooltip ref="tooltip" :append-to-body="false" placement="top" :content="col.tooltip[i18n]" v-if="col.tooltip">
                  <icon type="icon_question" color="#6C9AE7" style="margin-top: -2px"></icon>
                </el-tooltip>
                <span class="caret-wrapper" v-if="col.sortable"><i class="sort-caret ascending"></i><i class="sort-caret descending"></i></span>
                </div>
              </th>
            </tr>
          </thead>
        </table>
        <el-scrollbar style="height: calc(100% - 60px);width: 100%;">
          <div class="child-table-wrap" v-for="(child, idx) in data" :key="child.id || idx">
            <div class="left-title fl" :style="{width: '120px', height: child.children.length > 5 ? '180px' : 36 * child.children.length + 'px'}">
              <span class="one-line">
                {{child[columns[0].prop]}}
              </span>
            </div>
            <el-scrollbar :style="{height: child.children.length > 5 ? '180px' : 36 * child.children.length + 'px'}">
              <table cellspacing="0" cellpadding="0" border="0" class="child-table">
                <colgroup>
                  <col v-for="(col, idx) in columns1" :key="idx" :style="{'min-width': parseInt(col.width || 90) + 'px', width: parseInt(col.width || 90) + 'px'}">
                </colgroup>
                <tbody>
                  <tr v-for="(row, idx2) in child.children" :key="row.id || idx2" class="el-table__row">
                    <td v-for="col in columns1" :key="col.prop">
                      <div class="cell">
                        <a class="link one-line" v-if="!(isBms && bmsLinkDisbale[col.prop]) && clickTypes[col.prop] && parseFloat(row[col.prop]) > 0" @click="handleRowclick(child, row, col.prop)">{{row[col.prop]}}</a>
                        <span class="one-line" v-else-if="col.prop === 'cooperationRate'">{{row['sourceRate']}} / {{row['cooperationRate']}}</span>
                        <span class="one-line" v-else>{{row[col.prop]}}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </el-scrollbar>
          </div>
        </el-scrollbar>
        <div v-if="!data || data.length === 0" class="el-table__empty-block" style="height: calc(100% - 45px); position: absolute; top: 45px; background: rgb(255, 255, 255);">
          <span class="el-table__empty-text" style="padding-top: 75px;">暂无数据</span>
        </div>
      </div>
    </el-scrollbar>
</template>

<script>
  import { cloneDeep } from '@/utils/es'
  export default {
    name: 'chartTable',
    data() {
      return {
        // 是否 专业版
        isBms: this.BMS_PUBLIC_DATAS,
        // 当前排序列
        sortColumn: '',
        // 当前排序方式
        sortType: '',
        // 原始数据的copy
        dataCopy: [],
        // 数据加载中状态
        loading: false,
        // 专业版不可点击跳转明细的类型
        bmsLinkDisbale: {
          signedAmount: 1,
          quoteTotal: 1,
        },
        // 可点击跳转明细的类型
        clickTypes: {
          customerTotal: 1,
          replyEmailCustomerTotal: 1,
          sendEmailCustomerTotal: 1,
          unSendEmailCustomerTotal: 1,
          cooperationTotal: 1,
          moreOrderCustomerTotal: 1,
          signedAmount: 1,
          quoteTotal: 1,
        },
      }
    },
    props: {
      // 表格列定义
      columns: {
        type: Array,
        default: () => []
      },
      // 表格数据
      data: {
        type: Array,
        default: () => []
      },
      // 查询参数
      postParams: {
        type: Object
      }
    },
    computed: {
      // 当前语言 zh | en
      i18n() {
        return this.$i18n.locale
      },
      tableWidth() {
        return this.columns1.reduce((prev, cur) => {
          return prev + cur.width
        }, 120)
      },
      // 下标从1开始的列表定义
      columns1() {
        return this.columns.slice(1)
      }
    },
    methods: {
      /**
       * @description: 获取导出数据
       * @author: 万焕昌 <11******32@qq.com>
       * @time: 2021-03-18 15:20:56 Thursday
       */
      getExportData() {
        let header = this.columns.map(it => it.label[this.i18n])
        let body = this.data.reduce((prev, cur) => {
          let first = cur[this.columns[0].prop]
          prev.push(...cur.children.map(it => [first, ...this.columns1.map(col => it[col.prop])]))
          return prev
        }, [])
        return [header, ...body]
      },
      handleSort(col) {
        let hasChild = this.data.find((item)=> item.children && item.children.length > 1) // 含有多个子集的 就按照二级数据排列
        if (!col.sortable) return
        if (this.sortColumn !== col.prop) {
          this.sortColumn = col.prop
          this.sortType = 'ascending'
        } else if (this.sortType === '') {
          this.sortType = 'ascending'
        } else if (this.sortType === 'ascending') {
          this.sortType = 'descending'
        } else {
          this.sortType = ''
        }
        if (!this.sortType) {
          this.data = cloneDeep(this.dataCopy)
        } else if (this.sortType === 'ascending') {
          if (hasChild) {
            this.data.forEach(it => {
              it.children = it.children.sort((a, b) => this.sort(parseFloat(a[col.prop]), parseFloat(b[col.prop])))
            })
          } else {
            this.data.sort((a, b) => this.sort(parseFloat(a.children[0][col.prop]), parseFloat(b.children[0][col.prop])))
          }
        } else if (this.sortType === 'descending') {
          if (hasChild) {
            this.data.forEach(it => {
              it.children = it.children.sort((a, b) => this.sort(parseFloat(b[col.prop]), parseFloat(a[col.prop])))
            })
          } else {
            this.data.sort((a, b) => this.sort(parseFloat(b.children[0][col.prop]), parseFloat(a.children[0][col.prop])))
          }
        }
      },
      /**
       * @description: 排序方法  将 -- 改为最小
       * @author: 万焕昌 <1109923832@qq.com>
       * @time: 2020-12-06 13:29:34 Sunday
       * @param {*} a
       * @param {*} b
       */
      sort(a, b) {
        console.log(a, b)
        if (Number.isNaN(b)) {
          return 1
        }
        if (Number.isNaN(a)) {
          return -1
        }
        return a - b
      },
      /**
       * @description 行点击事件
       */
      handleRowclick(child, row, type) {
        let urlParam = ''
        let { startDate, endDate, hasDate } = this.postParams || {}
        if (startDate && endDate) {
          if (type === 'signedAmount') {
            urlParam += `&customerStartDate=${startDate}&customerEndDate=${endDate}`
          } else {
            urlParam += `&startDate=${startDate}&endDate=${endDate}`
          }
        } else if (hasDate === 0) {
          urlParam += '&hasDate=0' // 渠道质量没有时间的多带个参数给后端
        }
        this.columns.forEach((it, idx) => {
          let linkKey = it.linkKey
          if (idx === 0 && linkKey) {
            urlParam += `&${linkKey}=${child[it.dataKey]}`
          } else if (linkKey) {
            if (it.dataKey === 'productSpecId') {
              if (type === 'signedAmount') {
                urlParam += `&productIds=${row[it.dataKey] || child.productId}`
              } else {
                urlParam += `&${linkKey}=${row[it.dataKey] || child.productId}`
              }
            } else {
              urlParam += `&${linkKey}=${row[it.dataKey]}`
            }
          }
        })
        if (type === 'replyEmailCustomerTotal') {
          urlParam += '&queryStatsModule=6'
        }
        if (type === 'sendEmailCustomerTotal') {
          urlParam += '&queryStatsModule=7'
        }
        if (type === 'unSendEmailCustomerTotal') {
          urlParam += '&queryStatsModule=8'
        }
        if (type === 'cooperationTotal') {
          urlParam += '&isCooperation=1'
        }
        if (type === 'moreOrderCustomerTotal') {
          urlParam += '&isMoreOrderCustomer=1'
        }
        if (type === 'signedAmount') {
          this.openSystemUrl(`/order/order?type=paramQuery&orderStatus=8,1${urlParam}&t=${Date.now()}`)
        } else if (type === 'quoteTotal') {
          this.openSystemUrl(`/quote/quote?type=paramQuery${urlParam}&t=${Date.now()}`)
        } else {
          this.openSystemUrl(`/customer/customers?from=stats${urlParam}&t=${Date.now()}`)
        }
      },
    },
    watch: {
      columns() {
        this.$nextTick(() => {
          if (this.$refs.scrollbar) {
            this.$refs.scrollbar.update()
          }
          if (this.$refs.tooltip) {
            this.$refs.tooltip.forEach(vm => {
               this.$parent.$el.appendChild(vm.popperVM.$el)
            })
          }
        })
      },
      data: {
        handler: function () {
          this.dataCopy = cloneDeep(this.data)
          this.loading = true
          this.$nextTick(() => {
            this.loading = false
          })
        },
        immediate: true
      }
    }
  }
</script>

<style lang="scss" scoped>
.cell{
  .one-line{
    display: inline-block;
    max-width: calc(100% - 20px);
  }
}
.table-head.sortable{
  max-width: calc(100% - 14px);
  margin-right: 2px;
  display: inline-block;
  vertical-align: middle;
  margin-top: -3px;
}
.table-head.hasTooltip {
  max-width: calc(100% - 28px);
}
.chart-table{
  width: 100% !important;
  margin-left: 0;
  margin-top: 10px;
}
.child-table-wrap{
  position: relative;
  &::after{
    content: '';
    display: block;
    clear: both;
  }
  .left-title{
    position: absolute;
    z-index: 9;
    padding: 0 12px;
    top: 0;
    left: 0;
    // width: 120px;
    height: 100%;
    display: flex;
    text-align: left;
    flex-direction: column;
    justify-content: center;
    border-right: 1px solid #EBEEF5;
    border-bottom: 1px solid #EBEEF5;
  }
  .child-table{
    padding-left: 120px;
    width: 100%;
    table-layout: fixed;
    word-break: break-all;
    tbody{
      .el-table__row{
        height: 36px;
        line-height: 36px;
        td{
          padding: 0;
        }
      }
    }
  }
}
</style>
