<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button :params="postParams" path="businessFollowStep" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
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
            {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
            <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
          </div>
          <!-- <chart-dimension :data="chartDimension"></chart-dimension> -->
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <chart :legend="legend" :tooltip="tooltip" v-show="visible" ref="chart" :dataFn="dataFn" :showChart="visible" :settings="settings"></chart>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/**
* @author wanhuanchang <1109923832@qq.com>
* @desc 商机跟进阶段 图表
 */
import businessApi from 'api/businessApi'
import dateRange from './dateRange'
export default {
  name: 'businessFollowStepChart',
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
      return this.$tt('base', 'business.businessFollowStep')
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
      return businessApi.getBusinessStatusFunnel(params).then(resp=>{
          // resp.data.forEach(item=>{
          //   total += item.totalNum - 0;
          // })
          // let total = 0
          // this.totalNum = total
          this.$emit('getData', resp.data.businessStatusExcelList)
          let rows = (resp.data.businessStatusFunnelList || []).map(it => {
            return {
              dimension: `${it[this.$i18n.locale === 'zh' ? 'dimensionValue' : 'dimensionValueEn'] || '--'} - ${it.businessTotal} (${it.rate})`,
              totalNum: it.businessTotal
            }
          })
          return {
            columns: ['dimension', 'totalNum'],
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
</style>
