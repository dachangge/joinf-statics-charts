<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button :params="postParams" path="activeState" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <!-- 业绩分析 -->
        <span class="ft-pingfang">
          {{langs.activeState}}
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
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <chart v-show="visible" ref="chart" :dataFn="dataFn" :showChart="visible" :settings="settings" :legendVisible="false"></chart>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/**
* @author chenxin <542501270@qq.com>
* @time 2020年06月05日 14:51:11 星期五
* @desc 活跃状态 图表
* @vue-computed {Object} langs - 多语言翻译对象
 */
/* eslint-disable */

import customerApi from 'api/customerApi'
import dateRange from './dateRange'
export default {
  name: 'customerActiveStateChart',
  mixins: [dateRange],
  data() {
    return {
      chartDimension: [{
        text: '活跃度',
        value: 1,
        lang: 'activity'
      }, {
        text: '未联系',
        value: 2,
        lang: 'noContact'
      }],
      settings: {
        type: 'histogram',
        stack: {'total': ['totalContacted', 'totalNotContacted']},
        itemStyle: {
            },
        labelMap: {
            totalContacted: '已联系',
            totalNotContacted: '未联系',
            dimensionValue: '日期'
        },
        xAxisName: ['距今天数'],
        yAxisName: ['数量', ''],
      },
      dimension: 1, // 维度 id
      // 克隆对象
      postParams: {},
      totalNum: 0,
      visible: true
    }
  },
  computed: {
    langs() {
      return Object.assign({}, this.$t('base'), this.$t('chartDimension'), this.$t('customer'))
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
    this.settings.xAxisName = this.langs.DaysSinceNow
    this.settings.yAxisName = [this.langs.number, '']
    this.settings.labelMap.totalContacted = this.langs.contacted
    this.settings.labelMap.totalNotContacted = this.langs.noContact
    this.settings.labelMap.dimensionValue = this.langs.date
    Object.keys(this.params).forEach(key => {
      this.$watch(`params.${key}`, () => {
        this.refresh();
      })
    })
  },
  watch: {
    // 多语言重新加载图表
    '$i18n.locale'() {
      this.settings.xAxisName = this.langs.DaysSinceNow
      this.settings.yAxisName = [this.langs.number, '']
      this.settings.labelMap.totalContacted = this.langs.contacted
      this.settings.labelMap.totalNotContacted = this.langs.noContact
      this.settings.labelMap.dimensionValue = this.langs.date
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
      let params = {
        dimension: this.dimension
      }
      if (this.params && this.params.type !== 'dimension') {
        let info = this.params
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
      let columns = ['dimension', 'totalContacted', 'totalNotContacted']
      if (this.dimension === 1) {
        this.settings.stack = {}
        columns = ['dimension', 'totalContacted']
        this.settings.labelMap.totalContacted = this.langs.number
      } else {
        this.settings.labelMap.totalContacted = this.langs.contacted
        this.settings.stack = {'total': ['totalContacted', 'totalNotContacted']}
      }
      this.postParams = params
      return customerApi.getActiveState(params).then(resp=>{
        if (resp.success) {
          let arr = []
          this.totalNum = 0
          resp.data.forEach(item=>{
            arr.push({dimension: (this.$i18n.locale === 'zh' ? item.dimensionValue : item.dimensionValueEn) || this.langs.unknown, totalContacted: item.totalContacted, totalNotContacted: item.totalNotContacted})
          })
          this.$emit('getData', {
            data: resp.data,
            totalNum: this.totalNum,
            dimension: this.dimension,
            dimensionName: this.langs[this.chartDimension.filter(item=> { return item.value === this.dimension })[0].lang]
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
