<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button path="productSalesRanking" :params="postParams" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <span class="ft-pingfang">
          {{langs.productSalesRanking}}
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
          <chart-dimension v-if="params.dimension !== '1'" :data="chartDimension" v-model="dimension"></chart-dimension>
          <chart ref="chart" :dataFn="dataFn" :settings="settings" :showChart="visible" v-show="visible"></chart>
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
  name: 'productSalesRankingChart',
  mixins: [dateRange],
  data() {
    return {
      totalNum: 0,
      singDate: '',
      settings: {
        type: 'histogram',
        xAxisName: '产品分组',
        yAxisName: ['销售金额(USD)']
      },
      columns: ['产品分组', '销售金额(USD)'],
      visible: true,
      // 克隆对象
      postParams: {},
      chartDimension: [{
        text: '产品名称',
        value: 1,
        lang: 'productName'
      }, {
        text: '产品编码',
        value: 2,
        lang: 'productCode'
      }],
      dimension: 1
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
      this.settings.yAxisName = [this.langs.saleAmountUSD]
      this.refresh();
    },
    params(val) {
      let params = val
      delete params.showTotalWrap
      this.changeActive(params)
    },
    dimension() {
      this.refresh()
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
      params.reportType = 1
      if (!params.groupType) {
        params.groupType = '0'
      }
      if (!params.dimension) {
        params.dimension = '0'
      }
      if(params.dimension === '0') {
       delete params.groupIds
      }
      if(params.dimension === '1') {
       delete params.productIds
      }
      this.postParams = { ...params, dimension: this.dimension }
      delete params.products
      delete params.chartType
      return productApi.getProductsInfo(params).then(resp=>{
          if (resp.success) {
            resp.data = resp.data.productReportDtos
            let arr = []
            this.totalNum = 0
            let totalNum = this.totalNum
            resp.data.forEach(item=>{
              let totalAmount = item.totalAmount
              let newArr = {}
              totalAmount = Number(totalAmount ? totalAmount : 0)
              totalNum = Number(totalNum) + Number(totalAmount)
              this.singDate = item.singDate
              if (params.dimension === '1') {
                newArr[this.langs.productGroupName] = this.$i18n.locale === 'zh' ? item.chineseName : item.englishName
                newArr[this.langs.saleAmountUSD] = totalAmount
                arr.push(newArr)
                this.columns = [this.langs.productGroupName, this.langs.saleAmountUSD]
                this.settings.xAxisName = this.langs.productGroupName
              } else {
                if (this.dimension === 1) {
                  newArr[this.langs.productName] = this.$i18n.locale === 'zh' ? item.chineseName : item.englishName
                } else {
                  newArr[this.langs.productName] = item.code
                }
                newArr[this.langs.saleAmountUSD] = totalAmount
                arr.push(newArr)
                this.columns = [this.langs.productName, this.langs.saleAmountUSD]
                this.settings.xAxisName = this.dimension === 1 ? this.langs.productName : this.langs.productCode
              }
            })
            this.totalNum = totalNum
            this.$emit('getData', {moduleName: 'productSalesRankingChart', isCode: this.dimension === 2, data: resp.data, totalNum: totalNum.toFixed(2) })
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
