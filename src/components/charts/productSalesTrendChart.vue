<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button path="productSalesTrend" :params="postParams" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <span class="ft-pingfang">
          {{langs.productSalesTrend}}
            <!-- <span class="title-desc m-l-20">{{langs.saleAmount}}：{{totalNum.toFixed(2)}}</span> -->
        </span>
      </div>
      <!-- 图标内容 -->
      <div class="item-chart">
        <!-- 图标 -->
        <div class="w ft-chart">
          <div class="chart-summary">
            <span class="fr">{{langs.saleAmountUSD}}：{{totalNum.toFixed(2)}}</span>
            <!-- 统计时间 -->
            {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
            <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
          </div>
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <div class="inner-chart-wrap">
            <chart :height="height" ref="chart" :legend="legend" :dataFn="dataFn" :settings="settings" :showChart="visible" v-show="visible"></chart>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @author 李璐 <709145101@qq.com>
 * 销售排行
*/
/* eslint-disable */
import productApi from 'api/productApi'
import dateRange from './dateRange'
export default {
  name: 'productSalesTrendChart',
  mixins: [dateRange],
  data() {
    return {
      totalNum: 0,
      singDate: '',
      settings: {
        type: 'histogram',
        xAxisName: '日期',
        yAxisName: ['销售金额(USD)'],
        stack: {'产品分组': []},
        tooltip: {
          position: [10, 10]
        }
      },
      legend: {
        formatter: function (name) {
          if (!name) return '';
          if (name.length > 10) {
            return name.slice(0, 5) + '...';
          }
          return name
        },
        top: 'bottom'
      },
      visible: true,
      // 克隆对象
      postParams: {},
    }
  },
  props: {
    inDetail: {
      type: Boolean,
      default: () => false
    },
    params: {
      type: Object
    },
    showTotalWrap: {
      type: Boolean
    }
  },
  created() {
    Object.keys(this.params).forEach(key => {
      this.$watch(`params.${key}`, () => {
        this.refresh();
      })
    })
  },
  computed: {
    langs() {
      return Object.assign({}, this.$t('base'), this.$t('chartDimension'), this.$t('product'))
    }
  },
  watch: {
    // 多语言重新加载图表
    '$i18n.locale'() {
      this.setI18n()
      this.refresh()
    },
    params(val) {
      let params = val
      delete params.showTotalWrap
      this.changeActive(params)
    }
  },
  methods: {
    setI18n() {
      this.settings.yAxisName = [this.langs.saleAmountUSD]
      this.settings.xAxisName = this.langs.date
    },
    dataFn() {
      this.setI18n()
      let params = {}
      let that = this
      if (this.params) {
        /* eslint-disable no-restricted-syntax */
        /* eslint-disable guard-for-in */
        for (let i in this.params) {
          if (this.params[i] !== '' && i !== 'products') {
            if (Array.isArray(this.params[i])) {
              params[i] = this.params[i].join(',')
            } else {
              params[i] = this.params[i]
            }
          }
        }
      }
      params.reportType = 2
      if (params.groupType === undefined) {
        params.groupType = '0'
      }
      if (params.dimension === undefined) {
        params.dimension = '0'
      }
      if(params.dimension === '0') {
       delete params.groupIds
      }
      if(params.dimension === '1') {
       delete params.productIds
      }
      this.postParams = { ...params }
      delete params.products
      delete params.productsList
      delete params.productGroupList
      delete params.chartType
      return productApi.getProductsInfo(params).then(resp=>{
          if (resp.success) {
            let arr = []
            this.columns = []
            this.totalNum = 0
            if (resp.data.resultSort!=null) {
              for (var x in resp.data.resultSort) {
                let list = resp.data.resultSort[x]
                list.forEach(item=>{
                  this.columns.push(item.chineseName)
                  this.totalNum += Number(item.totalAmount)
                })
              }
              this.columns = Array.from(new Set(this.columns)) // 先循环一次 组装好 columns
              let columns = this.columns
              this.settings.stack = {'产品分组': columns}
              this.columns.unshift('日期')
              for (var x in resp.data.resultSort) {
                let list = resp.data.resultSort[x]
                let row = {}
                let dateStr = x.toString()
                if (dateStr.length === 6) {
                  row['日期'] = dateStr.substring(0,4) + '-' + dateStr.substring(4,6)
                } else if (dateStr.length === 8) {
                  row['日期'] = dateStr.substring(0,4) + '-' + dateStr.substring(4,6) + '-' + dateStr.substring(6,8)
                } else {
                  row['日期'] = dateStr
                }
                list.forEach(j=>{
                  row[j.chineseName] = Number(j.totalAmount).toFixed(2)
                })
                arr.push(row)
              }
            }
            this.$emit('getData', {moduleName: 'productSalesTrendChart', data: resp.data.productReportDtos, totalNum: this.totalNum })
            return {
              columns: that.columns,
              rows: arr
            }
          }
      })
    },
    /**
     * 查询条件变化
     */
    changeActive(info) {
      if (info.type === 'dimension') {
        this.dimension = info.value
      }
      this.filterParams = info
      if (this.$refs.chart) {
        this.$refs.chart.changeHandler(info)
      }
    },
    // 刷新表格
    refresh() {
      this.$refs.chart.refresh()
    }
  }
}
</script>

<style lang="scss" scoped>
.ft-chart {
  position: relative;
}
</style>
