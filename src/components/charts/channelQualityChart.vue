<template>
  <div :class="{'summary-item': !$attrs.inDetail}">
      <div class="item-content">
        <div class="item-title" v-if="!$attrs.inDetail">
          <!-- <div class="fr h">
            <view-button :params="postParams" path="channelQuality" :inCockpit="$attrs.inCockpit"></view-button>
            <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
          </div> -->
          <slot name="header"></slot>
          <!-- 有效互动 -->
          <span class="ft-pingfang">
            {{langs.title}}
          </span>
        </div>
        <div class="item-chart">
          <div class="w ft-chart">
            <div class="chart-summary" v-if="!$attrs.inDetail">
              <!-- 统计时间 -->
              &nbsp;
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
    name: 'channelQualityChart',
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
          text: '按年显示',
          value: 1,
          lang: 'year'
        }, {
          text: '按月显示',
          value: 2,
          lang: 'month'
        }, {
          text: '按员工显示',
          value: 3,
          lang: 'staff'
        }],
        // 表格数据
        tableData: [],
        // 表格列定义
        tableColumns: [
          {
            label: { zh: '客户来源', en: 'Customer Source' },
            prop: 'dimensionOneValue',
            linkKey: 'sources',
            dataKey: 'dimensionOneId',
            width: 120
          },
          {
            label: { zh: '创建年份', en: 'Date' },
            prop: 'dimensionTwoValue',
            linkKey: 'yearOrMonth',
            dataKey: 'dimensionTwoValue',
            width: 76,
            sortable: true
          },
          {
            label: { zh: '客户数量', en: 'Customer number' },
            prop: 'customerTotal',
            width: 100,
            sortable: true
          },
          {
            label: { zh: '总数比例/转化率(%)', en: 'Proportion / Conversion(%)' },
            prop: 'cooperationRate',
            width: 168
          },
          {
            label: { zh: '合作客户', en: 'Cooperative' },
            prop: 'cooperationTotal',
            width: 136,
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
        return this.$tt('base', 'total.channelQuality')
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
        this.postParams = params
        this.switchDate(this.dimension)
        customerApi.getChannelQuality(transferPropertyArrayToString(params)).then(res => {
          this.tableData = res.data.map(it => {
            return {
              ...it,
              children: it.customerChannelQualityDtoList
            }
          })
        })
      },
      switchDate(type) {
        if (type === 3) {
          this.tableColumns = [
              {
                label: { zh: '业务员', en: 'salesman' },
                prop: 'dimensionOneValue',
                linkKey: 'statisticsOperatorId',
                dataKey: 'dimensionOneId',
                width: 120
              },
              {
                label: { zh: '客户来源', en: 'Customer Source' },
                prop: 'dimensionTwoValue',
                linkKey: 'sources',
                dataKey: 'dimensionTwoId',
                width: 120,
                sortable: true
              },
              {
                label: { zh: '客户数量', en: 'Customer number' },
                prop: 'customerTotal',
                width: 100,
                sortable: true
              },
              {
                label: { zh: '总数比例/转化率(%)', en: 'Proportion / Conversion(%)' },
                prop: 'cooperationRate',
                width: 168
              },
              {
                label: { zh: '合作客户', en: 'Cooperative' },
                prop: 'cooperationTotal',
                width: 136,
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
                width: 180,
                sortable: true
              }
            ]
        } else {
          this.tableColumns = [
              {
                label: { zh: '客户来源', en: 'Customer Source' },
                prop: 'dimensionOneValue',
                linkKey: 'sources',
                dataKey: 'dimensionOneId',
                width: 120
              },
              {
                label: { zh: '创建年份', en: 'Date' },
                prop: 'dimensionTwoValue',
                linkKey: 'yearOrMonth',
                dataKey: 'dimensionTwoValue',
                width: 76,
                sortable: true
              },
              {
                label: { zh: '客户数量', en: 'Customer number' },
                prop: 'customerTotal',
                width: 100,
                sortable: true
              },
              {
                label: { zh: '总数比例/转化率(%)', en: 'Proportion / Conversion(%)' },
                prop: 'cooperationRate',
                width: 168
              },
              {
                label: { zh: '合作客户', en: 'Cooperative' },
                prop: 'cooperationTotal',
                width: 136,
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
                width: 180,
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
