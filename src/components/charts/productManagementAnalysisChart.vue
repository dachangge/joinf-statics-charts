<template>
  <div :class="{'summary-item': !$attrs.inDetail}">
      <div class="item-content">
        <div class="item-title" v-if="!$attrs.inDetail">
          <!-- <div class="fr h">
            <view-button :params="postParams" path="productManagementAnalysis" :inCockpit="$attrs.inCockpit"></view-button>
            <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
          </div> -->
          <slot name="header"></slot>
          <!-- 类型情况 -->
          <span class="ft-pingfang">
            {{langs.title}}
          </span>
        </div>
        <div class="item-chart">
          <div class="w ft-chart">
            <div class="chart-summary" v-if="!$attrs.inDetail">
              <!-- 统计时间 -->
              {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
              <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
            </div>
            <chart-dimension @change="getData" :data="chartDimension" v-model="dimension" />
            <chartTable ref="chart" class="chart-table" :data="tableData" :columns="tableColumns"/>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
  import chartTable from '@/components/chart-table/chartTable.vue'
  import dateRange from './dateRange'
  import productApi from 'api/productApi'
  import { transferPropertyArrayToString } from '@/utils/es.js'
  export default {
    name: 'productManagementAnalysisChart',
    mixins: [dateRange],
    components: {
      chartTable
    },
    data() {
      return {
        // 当前查询参数的克隆对象
        postParams: {},
        // 纬度值
        dimension: 1,
        // 维度选项
        chartDimension: [{
          text: '按产品编码',
          value: 1,
          lang: 'code'
        }, {
          text: '按分组',
          value: 2,
          lang: 'group'
        }],
        // 表格数据
        tableData: [],
        // 表格列定义
        tableColumns: [
          {
            label: { zh: '产品编码', en: 'productCode' },
            prop: 'productCode',
            width: 120,
            sortable: true
          },
          {
            label: { zh: '规格编号', en: 'specCode' },
            prop: 'productSpecCode',
            linkKey: 'productOrSpecId',
            dataKey: 'productSpecId',
            width: 76,
            sortable: true
          },
          {
            label: { zh: '中文名称', en: 'productNameCn' },
            prop: 'productNameCn',
            width: 100,
            sortable: true
          },
          {
            label: { zh: '成交金额(USD) ', en: 'Signed Amount' },
            prop: 'signedAmount',
            width: 168,
            sortable: true
          },
          {
            label: { zh: '返单客户数 (产生两笔订单以上的客户)', en: 'Returned(Customers with two more orders)' },
            prop: 'moreOrderCustomerTotal',
            width: 136,
            sortable: true
          },
          {
            label: { zh: '返单率(产生两笔订单以上的客户)', en: 'Refund rate(Customers with two more orders)' },
            prop: 'moreOrderRate',
            width: 136,
            sortable: true
          },
          {
            label: { zh: '采购单价', en: 'productCostPrice' },
            prop: 'productCostPrice',
            width: 100,
            sortable: true
          }
        ],
        observer: null
      }
    },
    props: {
      params: {
      }
    },
    computed: {
      langs() {
        return this.$tt('base', 'total.productManagementAnalysis')
      }
    },
    mounted() {
      this.observerOnce()
      Object.keys(this.params).forEach(key => {
        this.$watch(`params.${key}`, this.observerOnce)
      })
    },
    watch: {
      params() {
        this.observerOnce()
      }
    },
    methods: {
      observerOnce() {
        if (this.observer) {
          this.observer.unobserve(this.$el)
          this.observer.disconnect()
        }
        this.observer = new IntersectionObserver((() => {
          let called = false;
          return (entries) => {
            if (called) return;
            if (entries[0].intersectionRatio > 0) {
              called = true;
              this.getData()
            }
          }
        })());
        this.observer.observe(this.$el)
      },
      getData() {
        let params = {
          ...this.params,
          dimension: this.dimension
        }
        if (params.dateRange && Array.isArray(params.dateRange)) {
          params.startDate = params.dateRange[0]
          params.endDate = params.dateRange[1]
        }
        this.postParams = params
        this.switchDate(this.dimension)
        this.tableData = []
        if (this.dimension === 2) {
            productApi.getManageAnalyseGroup(transferPropertyArrayToString(params)).then(res => {
                if (res.data) {
                    this.tableData = res.data.map(it => {
                        return {
                        ...it,
                        children: [it]
                        }
                    })
                }
            })
        } else {
            productApi.getManageAnalyseCode(transferPropertyArrayToString(params)).then(res => {
                if (res.data) {
                    this.tableData = res.data.map(it => {
                        return {
                        ...it,
                        children: it.productManageAnalyseCodeDtoList.map(list => {
                                list.productNameCn = it.productNameCn
                                return list
                            })
                        }
                    })
                }
            })
        }
      },
      switchDate(type) {
        if (type === 2) {
              this.tableColumns = [
                {
                    label: { zh: '分组名称', en: 'groupNameCn' },
                    prop: 'groupNameCn',
                    linkKey: 'productIds',
                    dataKey: 'productIds',
                    width: 180,
                    sortable: true
                },
                {
                    label: { zh: '总客户数', en: 'Customer Total' },
                    prop: 'customerTotal',
                    width: 100,
                    sortable: true
                },
                {
                    label: { zh: '返单客户数(产生两笔订单以上的客户)', en: 'Returned(Customers with two more orders)' },
                    prop: 'moreOrderCustomerTotal',
                    width: 136,
                    sortable: true
                },
                {
                    label: { zh: '返单率(产生两笔订单以上的客户)', en: 'Refund rate(Customers with two more orders)' },
                    prop: 'moreOrderRate',
                    width: 136,
                    sortable: true
                },
                {
                    label: { zh: '报价次数', en: 'Quote Total' },
                    prop: 'quoteTotal',
                    width: 100,
                    sortable: true
                }
            ]
        } else {
            this.tableColumns = [
                {
                    label: { zh: '产品编码', en: 'productCode' },
                    prop: 'productCode',
                    width: 120
                },
                {
                    label: { zh: '规格编号', en: 'specCode' },
                    prop: 'productSpecCode',
                    linkKey: 'productOrSpecId',
                    dataKey: 'productSpecId',
                    width: 150
                },
                {
                    label: { zh: '中文名称', en: 'productNameCn' },
                    prop: 'productNameCn',
                    width: 168
                },
                {
                    label: { zh: '成交金额(USD) ', en: 'Signed Amount' },
                    prop: 'signedAmount',
                    width: 100,
                    sortable: true
                },
                {
                    label: { zh: '返单客户数(产生两笔订单以上的客户)', en: 'Returned(Customers with two more orders)' },
                    prop: 'moreOrderCustomerTotal',
                    width: 100,
                    sortable: true
                },
                {
                    label: { zh: '返单率(产生两笔订单以上的客户)', en: 'Refund rate(Customers with two more orders)' },
                    prop: 'moreOrderRate',
                    width: 100,
                    sortable: true
                },
                {
                    label: { zh: '采购单价', en: 'productCostPrice' },
                    prop: 'productCostPrice',
                    width: 100,
                    sortable: true
                }
            ]
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
