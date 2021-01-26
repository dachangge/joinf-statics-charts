<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button :params="postParams" path="customerOrderTrend" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <!-- 业绩分析 -->
        <span class="ft-pingfang">
          {{langs.orderTrend}}
          <!-- <span class="title-desc m-l-20">{{langs.customerTotal}}：{{totalNum}}</span> -->
        </span>
      </div>
        <!-- 图标内容 -->
      <div class="item-chart">
        <!-- 图标 -->
        <div class="w ft-chart">
          <div class="chart-summary" v-if="showTotalWrap">
            <!-- <span class="fr">{{langs.customerTotal}}：{{totalNum}}</span> -->
            <!-- 统计时间 -->
            {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
            <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
          </div>
          <chart-dimension :data="chartDimension" v-show="visible" v-model="dimension"></chart-dimension>
          <!-- <chart-type-switch class="detail-fixed-switch" v-show="inDetail && visible" :chart="chartIns" :types="['histogram', 'line']" :currentType="settings.type"></chart-type-switch> -->
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <chart v-show="visible" ref="chart" :tooltip="tooltip" :dataFn="dataFn" :showChart="visible" :settings="settings"></chart>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/**
* @author chenxin <542501270@qq.com>
* @time 2020年06月05日 14:51:11 星期五
* @desc 订单趋势 图表
* @vue-computed {Object} langs - 多语言翻译对象
 */

import customerApi from 'api/customerApi'
import dateRange from './dateRange'
export default {
  name: 'customerOrderTrendChart',
  mixins: [dateRange],
  data() {
    return {
      chartDimension: [{
        text: '整体趋势',
        value: 1,
        lang: 'overallTrend'
      }, {
        text: '国家/地区',
        value: 2,
        lang: 'regions',
        permitCode: 'displayRegion'
      }, {
        text: '类型',
        value: 3,
        lang: 'types',
        permitCode: 'displayType',
      }, {
        text: '来源',
        value: 4,
        lang: 'sources',
        permitCode: 'source'
      }, {
        text: '等级',
        value: 5,
        lang: 'grades',
        permitCode: 'grade'
      }, {
        text: '主营产品',
        value: 6,
        lang: 'mainProducts',
        permitCode: 'mainProduct'
      }],
      settings: {
        type: 'line',
        radius: [60, 130],
        offsetY: '45%',
        area: true,
        xAxisType: 'category',
        itemStyle: {
            // color: 'red',
            // borderColor: 'red'
        },
        labelMap: {
            totalAmount: '整体趋势',
            compareRate: '同比',
            dimensionValue: '日期'
        },
        xAxisName: '日期',
        yAxisName: ['趋势', ''],
        legendName: {
            dimensionValue: '日期'
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (arr) {
          console.log(arr)
          let str = arr[0].axisValue + '<br/>'
          arr.forEach((item, index)=>{
            if (arr[1].seriesName === '环比') {
              str += item.seriesName + '：' + item.value + (index === 0 ? '<br/>' : '')
            } else {
              str += item.seriesName + '：' + item.value[1] + (index === 0 ? '<br/>' : '')
            }
          })
          return str
        }
      },
      dimension: 1, // 维度 id
      // 克隆对象
      postParams: {},
      totalNum: 0,
      visible: true,
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
      return Object.assign({}, this.$t('base'), this.$t('chartDimension'), this.$t('customer'))
    }
  },
  created() {
    this.settings.xAxisName = this.langs.date
    this.settings.yAxisName = [this.langs.amountUSD, '']
    this.settings.labelMap.totalAmount = this.langs.amountUSD
    this.settings.labelMap.compareRate = this.langs.yearOnYear
    this.settings.labelMap.dimensionValue = this.langs.date
    this.settings.legendName.dimensionValue = this.langs.date
    Object.keys(this.params).forEach(key => {
      this.$watch(`params.${key}`, () => {
        this.refresh();
      })
    })
  },
  watch: {
    // 多语言重新加载图表
    '$i18n.locale'() {
      this.settings.xAxisName = this.langs.date
      this.settings.yAxisName = [this.langs.amountUSD, '']
      this.settings.labelMap.totalAmount = this.langs.amountUSD
      this.settings.labelMap.compareRate = this.langs.yearOnYear
      this.settings.labelMap.dimensionValue = this.langs.date
      this.settings.legendName.dimensionValue = this.langs.date
      this.refresh();
    },
    'dimension'(val) {
      this.changeActive({ type: 'dimension', value: this.dimension });
      if (val === 1) {
        this.settings.labelMap.compareRate = this.langs.yearOnYear
        this.settings.xAxisName = this.langs.date
        this.settings.type = 'line'
        this.settings.area = true
        this.settings.showline = []
      } else {
        this.settings.xAxisName = this.langs[this.chartDimension.filter(item=>{ return item.value === val })[0].lang]
        this.settings.labelMap.compareRate = this.langs.monthOnmonth
        this.settings.type = 'histogram'
        this.settings.area = false
        this.settings.showLine = ['compareRate']
      }
    },
  },
  methods: {
    /**
     * 查询展示 数据
     */
    dataFn() {
      let params = {
        dimension: this.dimension
      }
      if (this.params && this.params.type !== 'dimension') {
        let info = this.params
        /* eslint-disable no-restricted-syntax */
        /* eslint-disable guard-for-in */
        if (info.pubOrPri === '5' || info.pubOrPri === '4') {
          info.priShare = info.pubOrPri === '4' ? 1 : 0
          info.pubOrPri = 1
        }
        for (let i in info) {
          if (info[i] !== '') {
            params[i] = info[i]
          }
        }
      }
      this.postParams = { ...params }
      let columns = ['dimensionValue', 'totalAmount', 'compareRate']
      return customerApi.getOrderTrend(params).then(resp=>{
        if (resp.success) {
          let arr = []
          this.totalNum = 0
          resp.data.forEach(item=>{
            // item.totalAmount = parseFloat(item.totalAmount)
            // this.totalNum += item.totalAmount
            arr.push({ dimensionValue: item.dimensionValue || '暂无数据', totalAmount: item.totalAmount, compareRate: item.compareRate })
          })
          this.$emit('getData', {
            moduleName: 'customerOrderTrend',
            data: resp.data,
            totalNum: this.totalNum,
            dimension: this.dimension,
            dimensionName: this.dimension === 1 ? this.langs.date : this.langs[this.chartDimension.filter(item=> { return item.value === this.dimension })[0].lang]
          })
          return {
            columns: columns,
            rows: arr
          }
        }
      })
    },
    /**
     * 查询条件变化
     */
    changeActive(info) {
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
