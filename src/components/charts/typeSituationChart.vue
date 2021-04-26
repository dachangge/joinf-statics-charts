<template>
  <div :class="{'summary-item': !$attrs.inDetail}">
      <div class="item-content">
        <div class="item-title" v-if="!$attrs.inDetail">
          <!-- <div class="fr h">
            <view-button :params="postParams" path="typeSituation" :inCockpit="$attrs.inCockpit"></view-button>
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
            <chartTable ref="chart" class="chart-table" :data="tableData" :columns="tableColumns" :postParams="postParams" />
          </div>
        </div>
      </div>
  </div>
</template>

<script>
  import chartTable from '@/components/chart-table/chartTable.vue'
  import dateRange from './dateRange'
  import customerApi from 'api/customerApi'
  import { transferPropertyArrayToString } from '@/utils/es.js'
  export default {
    name: 'typeSituationChart',
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
          text: '按来源显示',
          value: 1,
          lang: 'source'
        }, {
          text: '按员工显示',
          value: 2,
          lang: 'staff'
        }, {
          text: '按国家显示',
          value: 3,
          lang: 'country'
        }, {
          text: '按年显示',
          value: 4,
          lang: 'year'
        }],
        // 表格数据
        tableData: [],
        // 表格列定义
        tableColumns: [
          {
            label: { zh: '来源', en: 'Source' },
            prop: 'dimensionValue',
            linkKey: 'sources',
            dataKey: 'dimensionId',
            width: 120,
            sortable: true
          },
          {
            label: { zh: '类型', en: 'Type' },
            prop: 'customerTypeName',
            linkKey: 'types',
            dataKey: 'customerType',
            width: 76
          },
          {
            label: { zh: '占比', en: 'Rate' },
            prop: 'typeRate',
            width: 100,
            sortable: true
          },
          {
            label: { zh: '客户数量 ', en: 'Customer Total ' },
            prop: 'customerTotal',
            width: 168,
            sortable: true
          },
          {
            label: { zh: '金额(USD)', en: 'Amount' },
            prop: 'signedAmount',
            width: 136,
            sortable: true
          },
          {
            label: { zh: '返单客户数(产生两笔订单以上的客户)', en: 'Returned(Customers with two more orders)' },
            prop: 'moreOrderCustomerTotal',
            width: 136,
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
        return this.$tt('base', 'total.typeSituation')
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
        this.tableData = []
        this.postParams = params
        this.switchDate(this.dimension)
        customerApi.getTypeCondition(transferPropertyArrayToString(params)).then(res => {
          this.tableData = res.data.map(it => {
            return {
              ...it,
              children: it.customerTypeConditionDtoList
            }
          })
        })
      },
      switchDate(type) {
        let item = this.tableColumns[0]
        if (type === 1) {
            item.label = { zh: '来源', en: 'Source' }
            item.linkKey = 'sources'
        } else if (type === 2) {
            item.label = { zh: '员工', en: 'Staff' }
            item.linkKey = 'statisticsOperatorId'
        } else if (type === 3) {
            item.label = { zh: '国家', en: 'State' }
            item.linkKey = 'regions'
        } else if (type === 4) {
            item.label = { zh: '年份', en: 'Year' }
            item.linkKey = 'yearOrMonth'
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
