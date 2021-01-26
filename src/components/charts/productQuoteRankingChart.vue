<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button path="productQuoteRanking" :params="postParams" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <span class="ft-pingfang">
          {{langs.productQuoteRanking}}
          <!-- <span class="title-desc m-l-20">{{langs.saleAmount}}：{{totalNum.toFixed(2)}}</span> -->
        </span>
      </div>
      <!-- 图标内容 -->
      <div class="item-chart">
        <div class="w ft-chart">
          <div class="chart-summary">
            <span class="fr">{{langs.saleAmountUSD}}：{{totalNum.toFixed(2)}}</span>
            <!-- 统计时间 -->
            {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
            <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
          </div>
          <!-- <chart-type-switch class="detail-fixed-switch" v-show="inDetail && visible" :chart="chartIns" :types="['histogram', 'line']" :currentType="settings.type"></chart-type-switch> -->
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <div class="inner-chart-wrap">
            <chart :height="height" ref="chart" :dataFn="dataFn" :settings="settings" :showChart="visible" v-show="visible"></chart>
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
  name: 'productQuoteRankingChart',
  mixins: [dateRange],
  data() {
    return {
      totalNum: 0,
      singDate: '',
      settings: {
        type: 'histogram',
        xAxisName: '产品分组',
        yAxisName: ['报价次数']
      },
      columns: ['产品分组', '报价次数'],
      visible: true,
      // 克隆对象
      postParams: {}
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
      this.settings.yAxisName = [this.langs.quoteTimes]
      this.refresh();
    },
    params(val) {
      let params = val
      delete params.showTotalWrap
      this.changeActive(params)
    }
  },
  methods: {
    dataFn() {
      let params = {}
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
      params.reportType = 4
      if (!params.groupType) {
        params.groupType = '0'
      }
      if(params.dimension === '0') {
       delete params.groupIds
      }
      if(params.dimension === '1') {
       delete params.productIds
      }
      this.postParams = { ...params }
      delete params.products
      delete params.chartType
      return productApi.getByProductQuoteDis(params).then(resp=>{
          if (resp.success) {
            resp.data = resp.data
            let arr = []
            this.totalNum = 0
            let totalNum = this.totalNum
            resp.data.forEach(item=>{
              let totalAmount = item.totalAmount
              let newArr = {}
              totalAmount = Number(totalAmount ? totalAmount : 0)
              totalNum = Number(totalNum) + Number(totalAmount)
              if (params.dimension === '1') {
                newArr[this.langs.productGroupName] = this.$i18n.locale === 'zh' ? item.dimensionValue : item.dimensionValueEn
                newArr[this.langs.quoteTimes] = totalAmount
                arr.push(newArr)
                this.columns = [this.langs.productGroupName, this.langs.quoteTimes]
                this.settings.xAxisName = this.langs.productGroupName
              } else {
                newArr[this.langs.productName] = this.$i18n.locale === 'zh' ? item.dimensionValue : item.dimensionValueEn
                newArr[this.langs.quoteTimes] = totalAmount
                arr.push(newArr)
                this.columns = [this.langs.productName, this.langs.quoteTimes]
                this.settings.xAxisName = this.langs.productName
              }
            })
            this.totalNum = totalNum
            this.$emit('getData', {moduleName: 'productQuoteRankingChart', data: resp.data, totalNum: totalNum.toFixed(2) })
            return {
              columns: this.columns,
              rows: arr
            }
          }
      })
    },
    /**
     * 查询条件变化
     */
    changeActive(info) {
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
