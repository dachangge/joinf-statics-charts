<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button path="productCategoryProportion" :params="postParams" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <span class="ft-pingfang">
          {{langs.productCategoryProportion}}
          <!-- <span class="title-desc m-l-20">{{langs.saleAmount}}：{{totalNum.toFixed(2)}}</span> -->
        </span>
      </div>
      <!-- 图标内容 -->
      <div class="item-chart">
        <div class="w ft-chart">
          <div class="chart-summary">
            <span class="fr">{{langs.saleAmountUSD}}：{{totalNum.toFixed(2)}}</span>
              <!-- 统计时间 -->
            {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
            <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
          </div>
          <chart-dimension :data="chartDimension" v-model="chartType" class="m-t-10" v-show="visible"></chart-dimension>
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <div name="productCategoryProportionChart" :style="{'height': height}"  style="margin-top: 20px; width:99%;" ref="productCategoryProportionChart" v-show="visible"></div>
          <div class="el-table__empty-block" style="position: absolute; top: 25px; bottom: 0px; left: 0px; right: 20px; background: rgb(255, 255, 255);" v-show="option.series.data === []"><span class="el-table__empty-text">暂无数据</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @author 李璐 <709145101@qq.com>
 * 类别占比
*/
/* eslint-disable */
import { globalConfig } from '@/components/index.js'
import echarts from 'echarts'
import productApi from 'api/productApi'
import screenfull from 'screenfull'
import dateRange from './dateRange'
export default {
  name: 'productCategoryProportionChart',
  mixins: [dateRange],
  data() {
    return {
      height: parseInt(globalConfig.defaultHeight) - 20 + 'px',
      colorList: [], // 颜色数组
      totalNum: 0,
      data: '',
      option: {
          series: {
              type: 'sunburst',
              data: [],
              highlightPolicy: 'ancestor',
              radius: ['15%', '100%'],
              label: {
                  rotate: 'radial'
              }
          }
      },
      chartType: 0,
      chartDimension: [{
        text: '销售金额',
        value: 0,
        lang: 'saleAmount'
      },{
        text: '产品数',
        value: 1,
        lang: 'productNumber'
      }],
      visible: true,
      // 克隆对象
      postParams: {},
      // 当前节点
      currentData: []
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
      this.$watch(`params.${key}`, (val, oldval) => {
        val = val ? (val.toString ? val.toString() : String(val)) : ''
        oldval = oldval ? (oldval.toString ? oldval.toString() : String(oldval)) : ''
        if (val === oldval) return
        this.initChart(this.params);
      })
    })
    this.chartType = this.params.chartType
    this.$watch('chartType', () => {
      this.changeActive({ type: 'chartType', value: this.chartType });
    })
  },
  mounted() {
    screenfull.on('change', () => {
      this.initChart(this.params)
    })
  },
  computed: {
    langs() {
      return Object.assign({}, this.$t('base'), this.$t('chartDimension'), this.$t('product'))
    }
  },
  watch: {
    // chartType(val) {
    //   this.changeActive({ type: 'chartType', value: this.chartType });
    // },
    // params(val) {
    //   // this.chartType = this.params.chartType
    //   // let params = val
    //   // console.log(this.chartType)
    //   // delete params.showTotalWrap
    //   // this.changeActive({ type: 'chartType', value: val.chartType });
    // }
  },
  mounted() {
    let observer = new IntersectionObserver(((entries) => {
      let called = false;
      return (entries) => {
        if (called) return;
        if (entries[0].intersectionRatio > 0) {
          called = true;
          this.initChart()
        }
      }
    })());
    observer.observe(this.$refs.productCategoryProportionChart)
  },
  methods: {
    ColorLuminance(hex, lum) {
      // validate hex string
      hex = String(hex).replace(/[^0-9a-f]/gi, '');
      if (hex.length < 6) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      }
      lum = lum || 0;
      // convert to decimal and change luminosity
      var rgb = "#", c, i;
      for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i*2,2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00"+c).substr(c.length);
      }
      return rgb;
    },
    reSetArr(data, parentId, color) {
      let arr = []
      let chartType = this.chartType
      for (var item of data) {
        item.parentId = parentId
        if (!parentId) {
          item.itemStyle = {
            color: this.colorList.shift()
          }
        } else {
          item.itemStyle = {
            color: this.ColorLuminance(color, 0.2)
          }
        }
        if (item.children) {
          let obj = {
            ...item,
            value: (chartType === 0 ? item.productTotal : item.productNum),
            name: item.name,
            children: this.reSetArr(item.children, item.id, item.itemStyle.color)
          }
          arr.push(obj)
        } else {
          arr.push({
            ...item,
            value: (chartType === 0 ? item.productTotal : item.productNum),
            name: item.name
          })
        }
      }
      return arr
    },
    /**
     * 将树结构 平铺
    */
    // transferTreeToList(obj) {
    //   let res = []
    //   if (obj.children && obj.children.length > 0) {
    //     obj.children.forEach(it => {
    //       res.push(...this.transferTreeToList(it))
    //     })
    //   }
    //   return res;
    // },
    transferTreeToList(data, res) {
      res.push(data)
      data.forEach(it => {
        if (it.children && it.children.length) {
          this.transferTreeToList([...it.children, { ...it, _id: it.id, id: null, children: null }], res)
        }
      })
    },
    initChart(info) {
      let params = {}
      let that = this
      if (this.params) {
        /* eslint-disable no-restricted-syntax */
        /* eslint-disable guard-for-in */
        for (let i in this.params) {
          if (this.params[i] !== '' && i !== 'products' && i !== 'chartType') {
            params[i] = this.params[i]
          }
        }
      }
      if (info) {
        params = info
      }
      if (params.groupType === undefined) {
        params.groupType = 0
      }
      params.reportType = 3
      this.postParams = { ...params }
      this.option.series.data = []
      this.postParams.dimension = '1'
      delete this.postParams.products
      delete this.postParams.productIds
      delete this.postParams.groupIds
      let sp = this.postParams
      let productCategoryProportionChart = echarts.init(this.$refs.productCategoryProportionChart)
      productApi.getByProductDistribution(sp).then(resp=>{
        if (resp.success) {
          this.colorList = ['#4086f0', '#78b84c', '#f1c46c', '#54b0c6']
          let data = this.reSetArr(resp.data)
          this.totalNum = 0
          data.forEach(item=>{
            let totalAmount = item.productTotal
            this.totalNum += Number(totalAmount)
            if (item.name && item.name.length > 3) {
              item.name = item.name.substring(0, 3) + '...'
            }
          })
          this.option.series.data = data
          productCategoryProportionChart.setOption(that.option)
          productCategoryProportionChart.off('click')
          // 闭包数据
          let sessionId;
          const sessionList = [];
          this.transferTreeToList(resp.data, sessionList)
          productCategoryProportionChart.on('click', (params) => {
            const data = params.data;
            let res = data.children || []
            if (data.id) {
              res = [...res, data]
              sessionId = data.id
            } else {
              let list = sessionList.find(it => it.some(i => i.id === sessionId));
              if (list) {
                sessionId = list[0].parentId
              }
              if (list === sessionList[0]) {
                return this.$emit('getData', {moduleName: 'productCategoryProportionChart', data: resp.data, totalNum: this.totalNum })
              }
              res = list
            }
            this.$emit('getData', {moduleName: 'productCategoryProportionChart', data: res.slice(0, res.length - 1), fixedLine: res[res.length - 1]})
          })
          this.$emit('getData', {moduleName: 'productCategoryProportionChart', data: resp.data, totalNum: this.totalNum })
        }
      })
    },
    /**
     * 查询条件变化
     */
    changeActive(info) {
      if (info.type === 'chartType') {
        this.chartType = (info.value ? info.value : 0)
        this.postParams.chartType = (info.value ? info.value : 0)
      }
      this.initChart(this.postParams)
    },
  }
}
</script>

<style lang="scss" scoped>
#productCategoryProportionChart{
  width: 100% !important;
  /deep/ &> div{
    width: 100% !important;
  }
}
.ft-chart {
  position: relative;
}
</style>
