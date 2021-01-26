<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button path="quoteConversionTrend" :params="postParams" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <span class="ft-pingfang">{{langs.quoteConversionTrend}}</span>
      </div>
      <!-- 图标内容 -->
      <div class="item-chart">
        <!-- 图标 -->
        <div class="w ft-chart">
          <div class="chart-summary" v-if="showTotalWrap">
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
 * 报价单转化趋势
*/
/* eslint-disable */
import quoteApi from 'api/quoteApi'
import dateRange from './dateRange'
export default {
  name: 'quoteConversionTrendChart',
  mixins: [dateRange],
  data() {
    return {
      totalNum: 0,
      singDate: '',
      settings: {
        type: 'line',
        area: true,
        metrics: ['报价单数量', '报价生成订单'],
        dimension: ['日期'],
        yAxisName: ['数量']
      },
      columns: ['日期', '报价单数量', '报价生成订单'],
      visible: true,
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
    this.setI18n()
    Object.keys(this.params).forEach(key => {
      this.$watch(`params.${key}`, () => {
        this.refresh();
      })
    })
  },
  computed: {
    langs() {
      return Object.assign({}, this.$t('base'), this.$t('chartDimension'), this.$t('quote'))
    }
  },
  watch: {
    // 多语言重新加载图表
    '$i18n.locale'() {
      this.setI18n()
      this.refresh();
    }
  },
  methods: {
    setI18n() {
      this.settings.yAxisName = [this.langs.number]
      this.settings.xAxisName = this.langs.date
      this.settings.metrics = [this.langs.quoteCount, this.langs.quoteToOrderCount]
      this.settings.dimension = [this.langs.date]
      this.columns = [this.langs.date, this.langs.quoteCount, this.langs.quoteToOrderCount]
    },
    dataFn() {
      let params = {}
      if (this.params && this.params.type !== 'dimension') {
        let info = this.params
        /* eslint-disable no-restricted-syntax */
        /* eslint-disable guard-for-in */
        for (let i in info) {
          if (info[i] !== '') {
            params[i] = info[i]
          }
        }
      }
      this.postParams = { ...params }
      return quoteApi.transformationAnalysis(params).then(resp=>{
          if (resp.success) {
            let data = resp.data
            let arr = []
            this.totalNum = 0
            data.forEach(item=>{
              let newArr = {}
              newArr[this.langs.date] = item.analysisDate
              newArr[this.langs.quoteCount] = item.quoteCount
              newArr[this.langs.quoteToOrderCount] = item.quoteToOrderCount
              arr.push(newArr)
            })
            // this.$emit('getData', { data: resp.data, totalNum: this.totalNum})
            this.$emit('getData', {
              moduleName: 'quoteConversionTrend',
              data: data,
              totalNum: this.totalNum
            })
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
