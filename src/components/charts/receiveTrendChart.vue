<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button :params="postParams" path="receiveTrend" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <!-- 收发趋势 -->
        <span class="ft-pingfang">
          {{langs.receiveTrend}}
          <!-- <span class="title-desc m-l-20">{{langs.emailTotal}}：{{totalNum}}</span> -->
        </span>
      </div>
        <!-- 图标内容 -->
      <div class="item-chart">
        <!-- 图标 -->
        <div class="w ft-chart">
          <div class="chart-summary" v-if="showTotalWrap">
            <span class="fr">{{langs.emailTotal}}：{{totalNum}}</span>
            <!-- 统计时间 -->
            {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
            <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
          </div>
          <!-- <chart-type-switch class="detail-fixed-switch" v-show="inDetail && visible" :chart="chartIns" :types="['histogram', 'line']" :currentType="settings.type"></chart-type-switch> -->
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <div class="inner-chart-wrap">
            <chart :height="height" v-show="visible" ref="chart" :dataFn="dataFn" :showChart="visible" :settings="settings"></chart>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/**
* @author chenxin <542501270@qq.com>
* @time 2020年06月05日 14:51:11 星期五
* @desc 邮件收发趋势 图表
* @vue-computed {Object} langs - 多语言翻译对象
 */
import emailApi from 'api/emailApi'
import dateRange from './dateRange'
export default {
  name: 'receiveTrendChart',
  mixins: [dateRange],
  data() {
    return {
      settings: {
        type: 'line',
        radius: [60, 130],
        offsetY: '45%',
        area: true,
        xAxisType: 'category',
        areaStyle: {
            // color: ''
        },
        itemStyle: {
            // color: 'red',
            // borderColor: 'red'
        },
        labelMap: {
            totalAmountReceive: '收件数',
            totalAmountSend: '发件数'
        },
        xAxisName: '日期',
        yAxisName: ['数量', ''],
        legendName: {
            dimensionValue: '日期'
        }
      },
      visible: true,
      // 克隆对象
      postParams: {},
      totalNum: 0
    }
  },
  computed: {
    langs() {
      return Object.assign({}, this.$t('base'), this.$t('staff.salesmanpk'), this.$t('email'))
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
    this.settings.xAxisName = this.langs.date
    this.settings.yAxisName = [this.langs.number, '']
    this.settings.labelMap.totalAmountReceive = this.langs.receivedCount
    this.settings.labelMap.totalAmountSend = this.langs.sentCount
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
      this.settings.yAxisName = [this.langs.trend, '']
      this.settings.labelMap.totalAmountReceive = this.langs.receivedCount
      this.settings.labelMap.totalAmountSend = this.langs.sentCount
      this.settings.legendName.dimensionValue = this.langs.date
      this.refresh();
    }
  },
  methods: {
    /**
     * 查询展示 数据
     */
    dataFn() {
      let params = {}
      let info = this.params
      /* eslint-disable no-restricted-syntax */
      /* eslint-disable guard-for-in */
      for (let i in info) {
        if (info[i] !== '') {
          params[i] = info[i]
        }
      }
      this.postParams = params
      let columns = ['dimensionValue', 'totalAmountReceive', 'totalAmountSend']
      return emailApi.getEmailSendAndRecTrend(params).then(resp=>{
        if (resp.success) {
          this.totalNum = 0
          let arr = []
          resp.data.forEach(item=>{
            this.totalNum += item.totalAmountReceive + item.totalAmountSend
            arr.push({ dimensionValue: item.dimensionValue || this.langs.unknown, totalAmountReceive: item.totalAmountReceive, totalAmountSend: item.totalAmountSend })
          })
          this.$emit('getData', {
            data: resp.data,
            totalNum: this.totalNum,
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
