<template>
  <!-- 订单币种占比 -->
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <!-- 图标title -->
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button path="orderCurrencyProportion" :params="postParams" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <span class="ft-pingfang">
          {{langs.orderCurrencyProportion}}
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
          <!-- <chart-type-switch class="detail-fixed-switch" v-show="inDetail && visible" :chart="chartIns" :types="['histogram', 'line', 'ring']" :currentType="settings.type"></chart-type-switch> -->
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <div class="inner-chart-wrap">
            <chart :height="height" ref="chart" :dataFn="dataFn" :showChart="visible" :settings="settings" v-show="visible" :tooltip="tooltip"></chart>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/**
* @author lilu <709145101@qq.com>
* @desc 订单币种占比 图表
* @vue-computed {Object} langs - 多语言翻译对象
 */
import orderApi from 'api/orderApi'
import dateRange from './dateRange'
import { arrayTopNum } from '@/utils/es.js'
export default {
  name: 'orderCurrencyProportionChart',
  mixins: [dateRange],
  data() {
    return {
      settings: {
        type: 'ring',
        radius: [50, 100]
      },
      columns: ['币种', '金额', '原币种金额'],
      filterParams: {},
      totalNum: 0,
      postParams: {},
      visible: true,
      tooltip: {
        formatter: function (item) {
          return item.name + ' : ' + item.value + ' (' + item.percent + '%)'
        }
      },
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
    this.setI18n()
    Object.keys(this.params).forEach(key => {
      this.$watch(`params.${key}`, () => {
        this.refresh();
      })
    })
  },
  computed: {
    langs() {
      let $t = this.$t.bind(this)
      return Object.assign({}, $t('base'), $t('chartDimension'), $t('order'))
    }
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
      this.columns = [this.langs.currency, this.langs.totalAmount, this.langs.sourceAmount]
    },
    /**
     * 查询展示 数据
     */
    dataFn() {
      let params = {
        dimension: 8
      }
      let that = this
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
      return orderApi.getByOrder(params).then(resp=>{
        let arr = []
        if (resp.success) {
          let data = arrayTopNum(resp.data, 14)
          this.totalNum = 0
          data.forEach(item=>{
            let newArr = {}
            let totalAmount = (item.totalAmount ? item.totalAmount : 0)
            let sourceAmount = (item.sourceAmount ? item.sourceAmount : 0)
            this.totalNum += Number(item.reportCount)
            if (totalAmount !== 0) {
              newArr[this.langs.currency] = item.currency
              newArr[this.langs.sourceAmount] = sourceAmount.toFixed(2)
              newArr[this.langs.totalAmount] = totalAmount.toFixed(2)
              arr.push(newArr)
            }
          })
          this.$emit('getData', {
            moduleName: 'orderCurrencyProportion',
            data: data,
            totalNum: this.totalNum,
            dimension: 8
          })
          this.tooltip = {
            formatter: (item) => {
              // let value = data.find(it => it.name === it[that.langs.sourceAmount])[that.langs.sourceAmount]
              let value = 0
              data.forEach(it=>{
                if (it.currency === item.name) {
                  value = it.sourceAmount
                }
              })
              return item.name + ' : ' + value + ' (' + item.percent + '%)'
            }
          }
          return {
            columns: that.columns,
            rows: arr
          }
        }
      })
    },
    /**
     * 查询条件变化
     */
    changeActive(info) {
      if (info.type === 'dimension') {
        this.dimension = info.value
      }
      this.filterParams = info
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
