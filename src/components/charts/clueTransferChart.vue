
<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button :params="postParams" path="clueTransfer" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <!-- 线索转移 -->
        <span class="ft-pingfang">
          {{langs.title}}
          <!-- <span class="title-desc m-l-20">{{langs.customerTotal}}：{{totalNum}}</span> -->
        </span>
      </div>
        <!-- 图标内容 -->
      <div class="item-chart">
        <!-- 图标 -->
        <div class="w ft-chart">
          <div class="chart-summary">
            <!-- <span class="fr">{{langs.clueTotal}}：{{totalClue}}</span> -->
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
 * @FilePath: /joinf-statistics-vuejs/src/components/charts/clueTransferChart.vue
 * @description: 线索转化
 * @author: 万焕昌 <1109923832@qq.com>
 * @time: 2020-11-23 09:45:36 Monday
*/
/* eslint-disable */
import businessApi from 'api/businessApi'
import dateRange from './dateRange'
import { transferPropertyArrayToString } from '@/utils/es.js'
export default {
  name: 'clueTransferChart',
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
        showLine: 'transferRateNum',
        axisSite: { right: ['transferRateNum'] },
        type: 'histogram',
        yAxisType: ['', 'percent'],
        stack: {'total': ['processedTotalNum', 'pendingTotalNum', 'ignoredTotalNum']},
        itemStyle: {
            },
        labelMap: {
            processedTotalNum: '已处理',
            pendingTotalNum: '待处理',
            ignoredTotalNum: '已忽略',
            transferRateNum: '转化率'
        },
        xAxisName: ['距今天数'],
        yAxisName: ['数量', '转化率'],
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
      return Object.assign({}, this.$t('base'), this.$t('business'), this.$t('business.clueTransfer'))
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
    // this.settings.xAxisName = this.langs.DaysSinceNow
    // this.settings.yAxisName = [this.langs.number, '']
    // this.settings.labelMap.totalContacted = this.langs.contacted
    // this.settings.labelMap.totalNotContacted = this.langs.noContact
    // this.settings.labelMap.dimensionValue = this.langs.date
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
        this.settings.xAxisName = [xName]
        this.settings.yAxisName = [this.langs.number, this.langs.transferRate]
        let rows = res.data.map(it => {
          return {
            ...it,
            label: lang === 'zh' ? it.dimensionValue : (it.dimensionValueEn || it.dimensionValue),
            transferRateNum: it.processedTotalNum/(it.processedTotalNum + it.pendingTotalNum),
            transferRate: `${((it.processedTotalNum * 100)/(it.processedTotalNum + it.pendingTotalNum)).toFixed(2)}`,
          }
        })
        // this.totalNum = rows.$sum('value')
        this.$emit('dataChange', {
          firstColumnName: xName,
          data: rows
        })
        return {
          columns: ['label', 'processedTotalNum', 'pendingTotalNum', 'ignoredTotalNum', 'transferRateNum'],
          rows
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
