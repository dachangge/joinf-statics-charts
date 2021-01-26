<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button :params="postParams" path="businessOrderPeriod" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <!-- 线索转移 -->
        <span class="ft-pingfang">
          {{langs.title}}
        </span>
      </div>
        <!-- 图标内容 -->
      <div class="item-chart">
        <!-- 图标 -->
        <div class="w ft-chart">
          <div class="chart-summary">
            <span class="fr">{{langs.businessTotal}}：{{totalClue}}</span>
            <!-- 统计时间 -->
            {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
            <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
          </div>
          <chart-dimension :data="chartDimension" v-show="visible" v-model="dimension"></chart-dimension>
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <chart v-show="visible" ref="chart" :dataFn="dataFn" :showChart="visible" :settings="settings" :legendVisible="false"></chart>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/**
 * @module: /joinf-statistics-vuejs/src/components/charts/businessOrderPeriodChart.vue
 * @description: 商机成单周期
 * @author: 万焕昌 <1109923832@qq.com>
 * @time: 2020-11-24 09:48:56 Tuesday
*/
/* eslint-disable */
import businessApi from 'api/businessApi'
import dateRange from './dateRange'
import { transferPropertyArrayToString } from '@/utils/es.js'
export default {
  name: 'businessOrderPeriodChart',
  mixins: [dateRange],
  data() {
    return {
      chartDimension: [{
        text: '来源',
        value: 2,
        lang: 'source'
      }, {
        text: '等级',
        value: 3,
        lang: 'starRating',
      }, {
        text: '员工',
        value: 1,
        permitCode: 'staff'
      }],
      settings: {
        type: 'histogram',
        stack: {'total': ['processedTotalNum', 'pendingTotalNum', 'ignoredTotalNum']},
        itemStyle: {
            },
        labelMap: {
            processedTotalNum: '已处理',
            pendingTotalNum: '待处理',
            ignoredTotalNum: '已忽略'
        },
        xAxisName: ['距今天数'],
        yAxisName: ['数量'],
      },
      dimension: 2, // 维度 默认来源
      // 克隆对象
      postParams: {},
      totalClue: 0,
      visible: true
    }
  },
  computed: {
    langs() {
      return Object.assign({}, this.$t('base'), this.$t('business'), this.$t('business.businessOrderPeriod'))
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
  watch: {
    // 多语言重新加载图表
    '$i18n.locale'() {
      this.refresh();
    },
    'dimension'(val) {
      this.changeActive({type: 'dimension', value: this.dimension});
    },
  },
  methods: {
    /**
     * 查询展示 数据
     */
    dataFn() {
      this.postParams = {
        ...this.params,
        dimension: this.dimension
      }
      return businessApi.getBusinessCluetransformation(transferPropertyArrayToString(this.postParams)).then(res => {
        const lang = this.$i18n.locale
        const langs = {
          1: {
            zh: '员工',
            en: 'staff'
          },
          2: {
            zh: '来源',
            en: 'source'
          },
          3: {
            zh: '等级',
            en: 'star'
          }
        }
        let xName = langs[this.dimension][lang]
        this.settings.xAxisName = xName
        this.settings.yAxisName = [this.langs.number]
        let rows = res.data.map(it => {
          return {
            label: lang === 'zh' ? it.dimensionValue : (it.dimensionValueEn || it.dimensionValue),
            transferRate: `${((it.processedTotalNum * 100)/(it.processedTotalNum + it.pendingTotalNum + it.ignoredTotalNum)).toFixed(2)}%`,
            ...it
          }
        })
        // this.totalNum = rows.$sum('value')
        this.$emit('dataChange', {
          firstColumnName: xName,
          data: rows
        })
        return {
          columns: ['label', 'processedTotalNum', 'pendingTotalNum', 'ignoredTotalNum'],
          rows
        }
      })
      // let params = {
      //   dimension: this.dimension
      // }
      // if (this.params && this.params.type !== 'dimension') {
      //   let info = this.params
      //   if (info.pubOrPri === '5' || info.pubOrPri === '4') {
      //     info.priShare = info.pubOrPri === '4' ? 1 : 0
      //     info.pubOrPri = 1
      //   }
      //   for (let i in info) {
      //     if (info[i] !== '') {
      //       params[i] = info[i]
      //     }
      //   }
      // }
      // let columns = ['dimension', 'totalContacted', 'totalNotContacted']
      // if (this.dimension === 1) {
      //   this.settings.stack = {}
      //   columns = ['dimension', 'totalContacted']
      //   this.settings.labelMap.totalContacted = this.langs.number
      // } else {
      //   this.settings.labelMap.totalContacted = this.langs.contacted
      //   this.settings.stack = {'total': ['totalContacted', 'totalNotContacted']}
      // }
      // this.postParams = params
      // return customerApi.getActiveState(params).then(resp=>{
      //   if (resp.success) {
      //     let arr = []
      //     this.totalNum = 0
      //     resp.data.forEach(item=>{
      //       arr.push({dimension: (this.$i18n.locale === 'zh' ? item.dimensionValue : item.dimensionValueEn) || this.langs.unknown, totalContacted: item.totalContacted, totalNotContacted: item.totalNotContacted})
      //     })
      //     this.$emit('getData', {
      //       data: resp.data,
      //       totalNum: this.totalNum,
      //       dimension: this.dimension,
      //       dimensionName: this.langs[this.chartDimension.filter(item=> { return item.value === this.dimension })[0].lang]
      //     })
      //     return {
      //       columns: columns,
      //       rows: arr
      //     }
      //   }
      // })
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
