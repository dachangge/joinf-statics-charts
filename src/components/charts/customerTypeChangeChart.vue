<template>
  <div :class="{'summary-item': !inDetail}">
    <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button path="customerTypeChange" :params="postParams" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <span class="ft-pingfang">
          {{langs.typeChange}}
          <!-- <span class="title-desc m-l-20">{{langs.saleAmount}}：{{totalNum.toFixed(2)}}</span> -->
        </span>
      </div>
      <!-- 图标内容 -->
      <div class="item-chart">
        <div class="w ft-chart">
          <div class="chart-summary">
              <!-- 统计时间 -->
            {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
            <i v-if="showDatePicker" class="el-icon-date cursor m-l-5" @click="mountPicker($event, params)"></i>
          </div>
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <div class="inner-chart-wrap">
            <div :style="{'height': height}" style="margin-top: 20px; width:99%;" ref="customerTypeChangeChart" v-show="visible"></div>
            <div v-show="dataShow" class="el-table__empty-block" :style="{'height': height}"><span class="el-table__empty-text">暂无数据</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @author 李璐 <709145101@qq.com>
 * 类型变动
*/
/* eslint-disable */
import echarts from 'echarts'
import customerApi from 'api/customerApi'
import screenfull from 'screenfull'
import dateRange from './dateRange'
export default {
  name: 'customerTypeChangeChart',
  mixins: [dateRange],
  data() {
    return {
      colorList: [], // 颜色数组
      totalNum: 0,
      dimension: 15,
      dataShow: false,
      option: {
          series: {
            type: "graph",
            layout: "force", // 'none'无部局，需要自己添加坐标,'circular'环形布局,'force'引导布局，出来的效果随机
            force:{
              repulsion: 150, // 节点间的斥力
              edgeLength: 20 // 两节点间距离，受斥力影响
            },
            symbolSize: 30,
            roam: true,
            label: {
              show: true
            },
            tooltip: {},
            edgeSymbol: ["circle", "arrow"],
            edgeSymbolSize: [3, 6],
            edgeLabel: {
              fontSize: 12
            },
            label: {
              show: true,
              textStyle: {
                fontSize: 11
              },
              formatter: function (param) {
                let name = param.name
                if (name.length <= 5) {
                  return name;
                } else {
                  name = name.slice(0,5) + '...';
                  return name;
                }
              }
            },
            itemStyle: {
              color: function (params) {
                var colorList = ['#3BA0FF', '#37CBCB', '#4DCB73', '#FFDA6B', '#FFA200', '#F2637B', '#975FE4', '#96514D', '#E6B422', '#00A381', '#824880', '#BF794E', '#D0AF4C', '#F5B1AA', '#BC64A4'];
                return colorList[params.dataIndex]
              }
            },
            data: [],
            links: [],
            lineStyle: {
              opacity: 0.9,
              width: 1,
              curveness: 0.1,
            }
          }
      },
      chartType: 0,
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
        if (val === oldval || val.toString() === oldval.toString()) return
        this.initChart(this.params);
      })
    })
  },
  mounted() {
    let observer = new IntersectionObserver(((entries) => {
      let called = false;
      return (entries) => {
        if (called) return;
        if (entries[0].intersectionRatio > 0) {
          called = true;
          this.initChart(this.params)
        }
      }
    })());
    observer.observe(this.$refs.customerTypeChangeChart)
  },
  computed: {
    langs() {
      return Object.assign({}, this.$t('base'), this.$t('chartDimension'), this.$t('customer'))
    }
  },
  watch: {
    // 多语言重新加载图表
    '$i18n.locale'() {
      this.initChart()
    }
  },
  methods: {
    initChart(info) {
      let that = this
      let params = {}
      if (this.params && this.params.type !== 'dimension') {
        let info = this.params
        /* eslint-disable no-restricted-syntax */
        /* eslint-disable guard-for-in */
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
      delete params.emailType
      delete params.customizeEmailNum
      this.postParams = { ...params }
      customerApi.getCustomerTypeChange(params).then(resp=>{
        if (resp.success) {
          let customerChangeDtoList = resp.data.customerChangeDtoList
          let customerDisReportDtoList = resp.data.customerChangeDetailDtoList
          let nameArr = []
          let listArr = []
          // if (customerChangeDtoList.length > 0) {
          //   customerChangeDtoList.forEach((item, index) => {
          //     let nameStr = this.$i18n.locale === 'zh' ? item.sourceName : item.sourceNameEn
          //     newArr.push({
          //       name: nameStr // .length > 4 ? nameStr.slice(0,3) + '...' : nameStr
          //     })
          //   })
          //   this.option.series.data = newArr
          // }
          if (customerDisReportDtoList.length > 0) {
            customerDisReportDtoList.forEach(item => {
              // let number = item.totalNum
              if (item.totalNumIn !== 0 || item.totalNumOut !== 0) {
                let nameStr = this.$i18n.locale === 'zh' ? item.dimensionValue : item.dimensionValueEn
                nameArr.push({
                  name: nameStr // .length > 4 ? nameStr.slice(0,3) + '...' : nameStr
                })
              }
            })
          }
          that.option.series.data = nameArr
          if (customerChangeDtoList.length > 0) {
            customerChangeDtoList.forEach(item => {
              let targetDtoList = item.targetDtoList
              if (targetDtoList.length > 0) {
                targetDtoList.forEach(list => {
                  listArr.push({
                    source: that.$i18n.locale === 'zh' ? item.sourceName : item.sourceNameEn, // .length > 4 ? item.sourceName.slice(0,3) + '...' : item.sourceName,
                    target:  that.$i18n.locale === 'zh' ? list.targetName : list.targetNameEn   // .length > 4 ? list.targetName.slice(0,3) + '...' : list.targetName
                  })
                })
              }
            })
          }
          that.option.series.links = listArr
          if (nameArr.length === 0) {
            this.dataShow = true
            this.visible = false
          } else {
            this.dataShow = false
            this.visible = true
          }
          this.$emit('dataChange', {moduleName: 'customerTypeChangeChart', data: customerDisReportDtoList.filter(item => item.totalNumIn !== 0 || item.totalNumOut !== 0) })
          // let domArr = document.getElementsByName("customerTypeChangeChart")
          // for (let i = 0; i < domArr.length; i++) {
          let customerTypeChangeChart = echarts.init(this.$refs.customerTypeChangeChart)
          customerTypeChangeChart.setOption(this.option)
          // }
        }
      })

    },
    /**
     * 查询条件变化
     */
    changeActive() {
      this.initChart(this.postParams)
    }
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
