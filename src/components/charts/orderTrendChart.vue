<template>
  <!-- 订单趋势 -->
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button path="orderTrend" :params="postParams" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <span class="ft-pingfang">
          {{langs.orderTrend}}
          <!-- <span class="title-desc m-l-20">{{langs.orderTotal}}：{{totalNum}}</span> -->
        </span>
      </div>
      <!-- 图标内容 -->
      <div class="item-chart">
        <!-- 图标 -->
        <div class="w ft-chart">
          <div class="chart-summary" v-if="showTotalWrap">
            <span class="fr">{{langs.orderTotal}}：{{totalNum}}</span>
            <!-- 统计时间 -->
            {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
            <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
          </div>
          <!-- <chart-type-switch class="detail-fixed-switch" v-show="inDetail && visible" :chart="chartIns" :types="['histogram', 'line']" :currentType="settings.type"></chart-type-switch> -->
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <div class="inner-chart-wrap">
            <chart :height="height" ref="chart" :dataFn="dataFn" :showChart="visible" :settings="settings" v-show="visible"></chart>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
* @author 李璐 <709145101@qq.com>
* @desc 订单趋势 图表
* @vue-computed {Object} langs - 多语言翻译对象
 */
import orderApi from 'api/orderApi'
import dateRange from './dateRange'
export default {
  name: 'orderTrendChart',
  mixins: [dateRange],
  data() {
    return {
      settings: {
        type: 'line',
        symbol: 'triangle',
        yAxisName: ['金额(USD)'],
        showLine: ['订单金额平均值(USD)']
      },
      columns: ['日期', '金额(USD)', '订单金额平均值(USD)'],
      dimension: 1, // 维度 id
      filterParams: {},
      totalNum: 0,
      postParams: {},
      visible: true
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
  computed: {
    langs() {
      return Object.assign({}, this.$t('base'), this.$t('chartDimension'), this.$t('order'))
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
  watch: {
    // 多语言重新加载图表
    '$i18n.locale'() {
      this.setI18n()
      this.refresh()
    }
  },
  methods: {
    setI18n() {
      this.settings.showLine = [this.langs.orderAvgAmount]
      this.settings.yAxisName = [this.langs.amountUSD]
      this.columns = [this.langs.date, this.langs.amountUSD, this.langs.orderAvgAmount]
    },
    /**
     * 查询展示 数据
     */
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
      return orderApi.getOrderTendency(params).then(resp=>{
        let arr = []
        if (resp.success) {
          let data = resp.data
          this.totalNum = 0
          data.forEach(item=>{
            this.totalNum += Number(item.orderCount)
            let newArr = {}
            newArr[this.langs.date] = item.analysisDate
            newArr[this.langs.amountUSD] = Number(item.amountUsd).toFixed(2)
            newArr[this.langs.orderAvgAmount] = Number(item.avgAmount).toFixed(2)
            arr.push(newArr)
          })
          this.$emit('getData', {
            moduleName: 'orderTrend',
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
    /**
     * 查询条件变化
     */
    changeActive(info) {
      if (info.type === 'dimension') {
        this.dimension = info.value
      }
      this.$refs.chart.changeHandler(info)
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
