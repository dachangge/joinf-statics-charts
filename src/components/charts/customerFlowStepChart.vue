<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button :params="postParams" path="followStep" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <!-- 业绩分析 -->
        <span class="ft-pingfang">
          {{langs.followStep}}
          <!-- <span class="title-desc m-l-20">{{langs.customerTotal}}：{{totalNum}}</span> -->
        </span>
      </div>
        <!-- 图标内容 -->
      <div class="item-chart">
        <!-- 图标 -->
        <div class="w ft-chart">
          <div class="chart-summary">
          <span class="fr">{{langs.customerTotal}}：{{totalNum}}</span>
            <!-- 统计时间 -->
            {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
            <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
          </div>
          <!-- <chart-dimension :data="chartDimension"></chart-dimension> -->
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <div class="inner-chart-wrap">
            <chart :legend="legend" :tooltip="tooltip" v-show="visible" ref="chart" :dataFn="dataFn" :showChart="visible" :settings="settings"></chart>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/**
* @author chenxin <542501270@qq.com>
* @time 2020年06月12日 13:51:11 星期五
* @desc 跟进阶段 图表
* @vue-computed {Object} langs - 多语言翻译对象
 */

import customerApi from 'api/customerApi'
import dateRange from './dateRange'
export default {
  name: 'flowStepChart',
  mixins: [dateRange],
  data() {
    return {
      legend: {
        formatter: function (name) {
          if (!name) return '';
          let idx = name.lastIndexOf('-')
          name = name.substring(0, idx).trim()
          if (name.length > 6) {
            return name.slice(0, 5) + '...';
          }
          return name
       }
      },
      tooltip: {
        formatter: function (item) {
          let tpl = []
          tpl.push(`${item.name}`)
          return tpl.join('')
       }
      },
      chartDimension: [],
      settings: {
        type: 'funnel',
        offsetY: '5%',
        left: 'left',
        label: {
          align: 'right',
          position: 'right'
         },
        calculable: true,
        useDefaultOrder: true,
      },
      totalNum: 0, // 客户总数
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
    }
  },
  computed: {
    langs() {
      return Object.assign({}, this.$t('base'), this.$t('customer'))
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
    }
  },
  methods: {
    dataFn() {
      let params = {
        dimension: 8
      }
      if (this.params) {
        let info = this.params
        // 当前维度为 员工
        if (info.pubOrPri === '5' || info.pubOrPri === '4') {
          info.priShare = info.pubOrPri === '4' ? 1 : 0
          info.pubOrPri = 1
        }
        /* eslint-disable no-restricted-syntax */
        /* eslint-disable guard-for-in */
        for (let i in info) {
          if (info[i] !== '') {
            params[i] = info[i]
          }
        }
      }
      this.postParams = { ...params }
      return customerApi.getCustomerDistributed(params).then(resp=>{
        if (resp.success) {
          console.log(resp.data)
          let arr = []
          let total = 0
          resp.data.forEach(item=>{
            total += item.totalNum - 0;
          })
          this.totalNum = total
          this.$emit('getData', {
            data: resp.data,
            totalNum: this.totalNum
          })
          resp.data.forEach(item=>{
            arr.push({ dimension: (item.dimensionValue + ' - ' + item.totalNum + ' ( ' + ((item.totalNum - 0) * 100 / total).toFixed(2) + '% )') || this.langs.unknown, totalNum: item.totalNum })
          })
          return {
            columns: ['dimension', 'totalNum'],
            rows: arr
          }
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
</style>
