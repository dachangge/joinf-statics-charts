<template>
<div :class="{'summary-item': !inDetail}">
  <div class="item-content">
    <!-- 图标title -->
    <div class="item-title" v-if="!inDetail">
      <!-- <div class="fr h">
        <view-button :params="postParams" path="clueProcessTimeliness" :inCockpit="$attrs.inCockpit"></view-button>
        <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
      </div> -->
      <slot name="header"></slot>
      <!-- 线索处理时效 -->
      <span class="ft-pingfang">
        {{langs.title}}
      </span>
    </div>
    <!-- 图标内容 -->
    <div class="item-chart">
      <!-- 图标 -->
      <div class="w ft-chart">
        <div class="chart-summary">
          <span class="fr">
            <!-- 线索总数 -->
            <!-- <span>{{langs.clueTotal}}：{{totalClue}}</span> -->
          </span>
          <!-- 统计时间 -->
          {{langs.statisticsTime}}：{{params.startDate}} ~ {{params.endDate}}
          <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
        </div>
        <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
        <!-- <chart-type-switsch style="right: 100px;" class="detail-fixed-switch" v-show="inDetail && visible" :chart="chartIns" :types="['histogram', 'line']" :currentType="settings.type"></chart-type-switsch> -->
        <div v-show="visible">
            <span style="position: absolute; right: 100px;z-index: 99;" v-if="inDetail">
            <!-- 线索总数 -->
            <!-- <span>{{langs.clueTotal}}：{{totalClue}}</span> -->
            </span>
            <chart-dimension :data="chartDimension" v-model="dimension"></chart-dimension>
            <chart ref="chart" :dataFn="dataFn" :showChart="visible" :settings="settings"></chart>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
/**
 * @author 万焕昌 <1109923832@qq.com>
 * 业绩分析图表
*/
/* eslint-disable */
import dateRange from './dateRange'
import businessApi from '@/api/businessApi.js'
import { transferPropertyArrayToString } from '@/utils/es.js'
export default {
  name: 'clueProcessTimelinessChart',
  mixins: [dateRange],
  props: {
    inDetail: {
      type: Boolean,
      default: () => false
    },
    params: {
      type: Object
    }
  },
  computed: {
    langs() {
      const t = this.$t;
      return Object.assign({}, t('base'), t('business'), t('business.clueProcessTimeliness'))
    }
  },
  data() {
    return {
      // 总线索
      totalClue: 0,
      // 维度
      dimension: 5,
      chartDimension: [{
        text: '整体情况',
        value: 5,
        lang: 'overall'
      }, {
        text: '等级',
        value: 3,
        lang: 'starRating'
      }, {
        text: '员工',
        value: 1,
        lang: 'staff'
      }, {
        text: '来源',
        value: 2,
        lang: 'source'
      },],
      settings: {
        type: 'histogram',
        yAxisName: ['时效'],
        lang: 'company'
      },
      visible: true,
      // params 克隆对象
      postParams: {}
    }
  },
  created() {
    if (this.params.dimension) this.dimension = this.params.dimension
    this.settings.yAxisName = ['时效']
    Object.keys(this.params).forEach(key => {
      this.$watch(`params.${key}`, this.refresh)
    })
  },
  methods: {
    /**
     * 查询数据
    */
    dataFn() {
      this.postParams = {
        ...this.params,
        dimension: this.dimension
      }
      return businessApi.getBusinessClueTreatTime(transferPropertyArrayToString(this.postParams)).then(res => {
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
          },
          5: {
            zh: '日期',
            en: 'date'
          }
        }
        let xName = langs[this.dimension][lang]
        this.settings.xAxisName = xName
        this.settings.yAxisName = [this.langs.averageTime]
        let rows = res.data.map(it => {
          return {
            ...it,
            label: lang === 'zh' ? it.dimensionValue : (it.dimensionValueEn || it.dimensionValue),
            value: it.processingTimeAvg,
            [this.langs.averageTime]: it.processingTimeAvg
          }
        })
        this.$emit('dataChange', {
          firstColumnName: xName,
          data: rows || 0
        })
        return {
          columns: ['label', this.langs.averageTime],
          rows
        }
      })
    },
    // 刷新表格
    refresh() {
      this.$refs.chart.refresh()
    }
  },
  watch: {
    'dimension'() {
      this.refresh();
    },
    // 多语言重新加载图表
    '$i18n.locale'(val) {
      this.refresh();
    }
  }
}
</script>

<style lang="scss" scoped>
  .bf-bar::before{
    content: '';
    display: inline-block;
    width: 1px;
    height: 12px;
    position: relative;
    top: 2px;
    margin-left: 7px;
    margin-right: 5px;
    background:  #D9DEE5;
  }
  .bf-bar.isFullscreen::before{
    display: none;
  }
.ft-chart{
  position: relative;

}
</style>
