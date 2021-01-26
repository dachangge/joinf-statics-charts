<template>
  <!-- 业绩分析 -->
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <!-- 图标title -->
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button path="quoteDistribution" :params="postParams" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <span class="ft-pingfang">{{langs.quoteDistribution}}</span>
      </div>
      <!-- 图标内容 -->
      <div class="item-chart">
        <div class="w ft-chart">
          <div class="chart-summary" v-if="showTotalWrap">
            <span class="fr">{{langs.saleAmountUSD}}：{{totalNum.toFixed(2)}}</span>
            <!-- 统计时间 -->
            {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
            <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
          </div>
          <chart-dimension :data="chartDimension" v-model="dimension" class="m-t-10" v-show="visible"></chart-dimension>
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <chart ref="chart" :dataFn="dataFn" :settings="settings" :yAxis="yAxis" :showChart="visible" v-show="visible"></chart>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @author 李璐 <709145101@qq.com>
 * 报价单分布
*/
/* eslint-disable */
import quoteApi from 'api/quoteApi'
import dateRange from './dateRange'
export default {
  name: 'quoteDistributionChart',
  mixins: [dateRange],
  data() {
    return {
      dimension: 1,
      totalNum: 0,
      singDate: '',
      chartDimension: [{
        text: '业务员',
        value: 1,
        lang: 'operatorName'
      }, {
        text: '国家地区',
        value: 2,
        lang: 'regionName',
        permitCode: 'displayRegion'
      }, {
        text: '客户名称',
        value: 3,
        lang: 'customerName'
      },{
        text: '客户来源',
        value: 5,
        lang: 'sourceName',
        permitCode: 'source'
      }, {
        text: '主营产品',
        value: 4,
        lang: 'mainProducts',
        permitCode: 'mainProduct'
      }, {
        text: '产品',
        value: 7,
        lang: 'productName'
      }, {
        text: '产品分组',
        value: 6,
        lang: 'productGroupName'
      }],
      settings: {
        type: 'histogram',
        yAxisName: ['金额(USD)', '数量'],
        axisSite: { right: ['数量'] },
        showLine: ['数量'],
      },
      leftMax: 0,
      rightMax: 0,
      yAxis: [],
      columns: ['业务员', '金额(USD)', '数量'],
      visible: true,
      postParams: {}
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
      return Object.assign({}, this.$t('base'), this.$t('chartDimension'), this.$t('quote'))
    }
  },
  watch: {
    // 多语言重新加载图表
    '$i18n.locale'() {
      this.setI18n()
      this.refresh()
    },
    'dimension'(val) {
      this.changeActive({ type: 'dimension', value: this.dimension });
      this.settings.xAxisName = this.chartDimension.filter(item=>{ return item.value === val })[0].text
      this.setI18n()
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
  methods: {
    setI18n() {
      let number = this.langs.number
      let amountUSD = this.langs.amountUSD
      this.settings.showLine = [number]
      this.settings.axisSite = { right: [number] }
      this.settings.yAxisName = [amountUSD, number]
    },
    dataFn() {
      let params = {
        dimension: this.dimension
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
      return quoteApi.getQuoteInfo(params).then(resp=>{
          if (resp.success) {
            let data = resp.data
            let arr = []
            let langs = this.langs
            this.totalNum = 0
            data.forEach((item, index)=>{
              let totalAmountUSD = (item.totalAmountUSD ? item.totalAmountUSD : 0)
              if (this.leftMax < totalAmountUSD) {
                this.leftMax = parseInt((totalAmountUSD + 2000) / 1000) * 1000
              }
              if (this.rightMax < item.reportCount) {
                this.rightMax = parseInt((item.reportCount + 10) / 10) * 10
              }
              this.totalNum += Number(totalAmountUSD)
              this.singDate = item.singDate
              let amountUSD = this.langs.amountUSD
              let number = this.langs.number
              let operatorName = that.langs.operatorName
              let regionName = that.langs.regionName
              let customerName = that.langs.customerName
              let mainProducts = that.langs.mainProducts
              let sourceName = that.langs.sourceName
              let productName = that.langs.productName
              let productGroupName = that.langs.productGroupName
              let newArr = {}
              switch (this.dimension) {
                case 1:
                  newArr[operatorName] = that.$i18n.locale === 'zh' ? item.operatorName : item.operatorNameEn
                  newArr[amountUSD] = totalAmountUSD.toFixed(2)
                  newArr[number] = item.reportCount
                  arr.push(newArr)
                  that.columns = [operatorName, amountUSD, number]
                  that.settings.xAxisName = operatorName
                  break;
                case 2:
                  newArr[regionName] = that.$i18n.locale === 'zh' ? item.regionName : item.regionNameEn
                  newArr[amountUSD] = totalAmountUSD.toFixed(2)
                  newArr[number] = item.reportCount
                  arr.push(newArr)
                  that.columns = [regionName, amountUSD, number]
                  that.settings.xAxisName = regionName
                  break;
                case 3:
                  newArr[customerName] = that.$i18n.locale === 'zh' ? item.customerName : item.customerName
                  newArr[amountUSD] = totalAmountUSD.toFixed(2)
                  newArr[number] = item.reportCount
                  arr.push(newArr)
                  that.columns = [customerName, amountUSD, number]
                  that.settings.xAxisName = customerName
                  break;
                case 4:
                  newArr[mainProducts] = that.$i18n.locale === 'zh' ? item.mainProducts : item.mainProductEn
                  newArr[amountUSD] = totalAmountUSD.toFixed(2)
                  newArr[number] = item.reportCount
                  arr.push(newArr)
                  that.columns = [mainProducts, amountUSD, number]
                  that.settings.xAxisName = mainProducts
                  break;
                case 5:
                  newArr[sourceName] = that.$i18n.locale === 'zh' ? item.sourceName : item.sourceNameEn
                  newArr[amountUSD] = totalAmountUSD.toFixed(2)
                  newArr[number] = item.reportCount
                  arr.push(newArr)
                  that.columns = [sourceName, amountUSD, number]
                  that.settings.xAxisName = sourceName
                  break;
                case 7:
                  newArr[productName] = that.$i18n.locale === 'zh' ? item.productName : item.productNameEn
                  newArr[amountUSD] = totalAmountUSD.toFixed(2)
                  newArr[number] = item.reportCount
                  arr.push(newArr)
                  that.columns = [productName, amountUSD, number]
                  that.settings.xAxisName = productName
                  break;
                case 6:
                  newArr[productGroupName] = that.$i18n.locale === 'zh' ? item.productGroupName : item.productGroupName
                  newArr[amountUSD] = totalAmountUSD.toFixed(2)
                  newArr[number] = item.reportCount
                  arr.push(newArr)
                  that.columns = [productGroupName, amountUSD, number]
                  that.settings.xAxisName = productGroupName
                  break;
                default:
                  break;
              }
              // if (index === 14) {
              //   item.children = resp.data.splice(14).map((list, index1)=>{
              //     return {
              //     ...list,
              //     index: index + index1 + 1
              //   }
              //   })
              // }
            })
            this.yAxis = [{
              name: this.langs.amountUSD,
              max: this.leftMax,
              min: 0,
              splitNumber: 5,
              interval: (this.leftMax - 0) / 5,
              splitLine: {
                show: true
              },
              axisTick: {
                // y轴刻度线
                show: false
              }
            },
            {
              name: this.langs.number,
              type: 'value',
              max: this.rightMax,
              min: 0,
              splitNumber: 5,
              interval: (this.rightMax - 0) / 5,
              splitLine: {
                show: true
              },
              axisTick: {
                // y轴刻度线
                show: false
              }
            }]
            this.$emit('getData', {
              data: data,
              totalNum: this.totalNum,
              dimension: this.dimension,
              dimensionName: this.langs[this.chartDimension.filter(item=> { return item.value === this.dimension })[0].lang]
            })
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
