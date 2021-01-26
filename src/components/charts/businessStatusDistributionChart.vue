<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button :params="postParams" path="businessStatusDistribution" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <!-- 商机状态分布状态 -->
        <span class="ft-pingfang">
          {{langs.title}}
        </span>
      </div>
        <!-- 图标内容 -->
      <div class="item-chart">
        <!-- 图标 -->
        <div class="w ft-chart">
          <div class="chart-summary">
            <!-- 统计时间 -->
            <span class="fr">{{langs.businessTotal}}：{{totalNum}}</span>
            {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
            <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
          </div>
          <!-- <chart-type-switch :style="{right: '90px'}" class="detail-fixed-switch" v-show="inDetail && visible" :chart="chartIns" :types="['histogram', 'line', 'ring']" :currentType="settings.type"></chart-type-switch> -->
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <div class="inner-chart-wrap">
            <chart :legend="legend" v-show="visible" ref="chart" :dataFn="dataFn" :showChart="visible" :settings="settings"></chart>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @FilePath: /joinf-statistics-vuejs/src/components/charts/businessStatusDistributionChart.vue
 * @description: 商机状态分布
 * @author: 万焕昌 <1109923832@qq.com>
 * @time: 2020-11-23 15:04:38 Monday
*/
import dateRange from './dateRange'
import businessApi from 'api/businessApi'
import { transferPropertyArrayToString } from '@/utils/es.js'
export default {
  name: 'businessStatusDistributionChart',
  mixins: [dateRange],
  data() {
    return {
      legend: {
        formatter: function (name) {
          if (!name) return '';
          if (name.length > 20) {
            return name.slice(0, 15) + '...';
          }
          return name
       }
      },
      settings: {
        type: 'ring',
        radius: [60, 130],
        offsetY: '45%',
        notBarAxis: true,
      },
      filterParams: {},
      totalNum: 0,
      // 克隆对象
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
      return Object.assign({}, this.$t('base'), this.$t('business'), this.$t('business.businessStatusDistribution'))
    }
  },
  watch: {
    'dimension'() {
      this.refresh()
    },
    // 多语言重新加载图表
    '$i18n.locale'() {
      this.refresh()
    },
    'visible'() {
      this.$emit('getData', {
        chartVisible: this.visible
      })
    }
  },
  created() {
    Object.keys(this.params).forEach(key => {
      this.$watch(`params.${key}`, () => {
        this.refresh();
      })
    })
  },
  methods: {
    /**
     * 查询展示 数据
     */
    dataFn() {
      /* eslint-disable */
      this.postParams = {
        ...this.params,
      }
      return businessApi.getBusinessStatusDistributed(transferPropertyArrayToString(this.postParams)).then(res => {
        const lang = this.$i18n.locale
        let xName = lang === 'zh' ? '状态' : 'status'
        this.settings.xAxisName = xName
        this.settings.yAxisName = [this.langs.number]
        let rows = res.data.map(it => {
          return {
            ...it,
            label: lang === 'zh' ? it.dimensionValue : (it.dimensionValueEn || it.dimensionValue),
            value: it.totalNum,
            [this.langs.number]: it.totalNum
          }
        })
        this.totalNum = rows.$sum('value')
        this.$emit('dataChange', {
          firstColumnName: xName,
          data: rows
        })
        return {
          columns: ['label', this.langs.number],
          rows
        }
      })
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
.desc-info{
  display: inline-block;
  line-height: 24px;
  margin-left: 20px;
  border: 1px solid #C5E3F2;
  border-radius: 2px;
  background: #f3fcff;
  padding: 0 10px;
  color: #34B2FF;
}
</style>
