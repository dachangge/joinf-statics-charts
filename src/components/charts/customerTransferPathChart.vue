<template>
<div :class="{'summary-item': !inDetail}">
  <div class="item-content">
      <div class="item-title" v-if="!inDetail">
        <!-- <div class="fr h">
          <view-button :params="postParams" path="transferPath" :inCockpit="$attrs.inCockpit"></view-button>
          <dashboard-button class="m-l-20" :chartName="$options.name"></dashboard-button>
        </div> -->
        <slot name="header"></slot>
        <span class="ft-pingfang">{{langs.transferPath}}</span>
      </div>
      <div class="item-chart">
        <div class="w ft-chart">
          <div class="chart-summary">
            <!-- <div class="fr">{{langs.customerTotal}}：{{totalNum}}</div> -->
            {{langs.statisticsTime}}：{{params.startDate | timeWithoutHourSecondMinute}} ~ {{params.endDate | timeWithoutHourSecondMinute}}
          </div>
          <!-- <hide-button class="detail-fixed-btn" v-show="inDetail" v-model="visible"></hide-button> -->
          <div v-show="visible" ref="chartIns" style="margin-top: 20px;height:380px; width:99%;"></div>
          <div class="el-table__empty-block" style="position: absolute; top: 25px; bottom: 0px; left: 0px; right: 20px; background: rgb(255, 255, 255);" v-show="showNoData"><span class="el-table__empty-text">暂无数据</span></div>
        </div>
      </div>
  </div>
</div>
</template>

<script>
/**
* @author wanhuanchang <1109923832@qq.com>
* @desc 转移路劲 图表
* @vue-computed {Object} langs - 多语言翻译对象
 */
/* eslint-disable */
import echarts from 'echarts'
import { getStringEllipsis } from '@/utils/es.js'
import customerApi from 'api/customerApi'
import dateRange from './dateRange'
import commonApi from '@/api/commonApi'
// import sendTrackingVue from '@/views/email/components/sendTracking.vue'
export default {
  name: 'transferPathChart',
  mixins: [dateRange],
  data() {
    return {
      visible: true,
      chartDimension: [],
      settings: {
        type: 'graph',
        layout: 'circular',
        circular: {
            rotateLabel: true
        },
        offsetY: '5%',
        left: 'left',
        label: {
          align: 'right',
          position: 'right'
         },
        calculable: true,
        useDefaultOrder: true,
        // dataType: 'percent'
      },
      totalNum: 0, // 客户总数
      data: [],
      showNoData: false,
      chartOptions: {},
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
    }
  },
  computed: {
    langs() {
      return this.$tt('base', 'customer.transferPath')
    }
  },
  mounted() {
    // this.refresh()
    let observer = new IntersectionObserver(((entries) => {
      let called = false;
      return (entries) => {
        if (called) return;
        if (entries[0].intersectionRatio > 0) {
          called = true;
          this.refresh()
        }
      }
    })());
    observer.observe(this.$refs.chartIns)
  },
  created() {
    Object.keys(this.params).forEach(key => {
      this.$watch(`params.${key}`, (val, oldval) => {
        val = val ? (val.toString ? val.toString() : String(val)) : ''
        oldval = oldval ? (oldval.toString ? oldval.toString() : String(oldval)) : ''
        if (val === oldval) return
        this.refresh()
      })
    })
  },
  methods: {
    /**
     * 刷新图表数据
    */
    refresh() {
      this.postParams = { ...this.params }
      const params = {
        ...this.params,
        startDate: this.params.startDate ? this.params.startDate + ' 00:00:00' : null,
        endDate: this.params.endDate ? this.params.endDate + ' 23:59:59' : null,
      }
      Object.keys(params).forEach(key => {
        if (Array.isArray(params[key])) {
          params[key] = params[key].join(',')
        }
      })
      customerApi.getCustomerTransferPath(params).then(res => {
        // console.error(res)
        const { customerChangeDtoList, customerTransferPathDtoList } = res.data
        this.data = res.data
        this.$emit('dataChange', {
          data: customerTransferPathDtoList
        })
        if (res.data.customerChangeDtoList.length === 0  && res.data.customerTransferPathDtoList.length === 0) {
          this.showNoData = true
        } else {
          this.showNoData = false
        }
        let data = this.calcCoordinate(customerChangeDtoList)
        let links = this.genrateLinks(customerChangeDtoList)
        // console.error(data, links)
        const myChart = echarts.init(this.$refs.chartIns)
        this.chartOptions = {
          tooltip: {
            formatter: function (item) {
              return item.data._name
            }
          },
          animationDurationUpdate: 1500,
          animationEasingUpdate: 'quinticInOut',
          series: [
              {
                  name: 'Les Miserables',
                  type: 'graph',
                  layout: 'circular',
                  circular: {
                      rotateLabel: true
                  },
                  data,
                  links,
                  roam: true,
                  label: {
                      position: 'right',
                      formatter: '{b}'
                  },
                  lineStyle: {
                      color: 'source',
                      curveness: 0.3
                  }
              }
          ]
        }
        myChart.setOption(this.chartOptions)
      })
    },
    /**
     * 生成连接线
    */
    genrateLinks(objectList) {
      return objectList.reduce((prevRes, cur) => {
        return prevRes.concat(cur.targetDtoList.map((it, idx) => {
          return {
            id: idx,
            source: cur.sourceId.toString(),
            target: it.targetId.toString()
          }
        }))
      }, [])
    },
    /**
     * 获取0 -255 的16进制集合
    */
    getHex() {
      let random = Math.floor((Math.random() * 256))
      random = random.toString(16)
      return random.length === 2 ? random : `0${random}`
    },
    /**
     * 获取随机颜色
    */
    getHexColorRandom() {
        return `#${this.getHex()}${this.getHex()}${this.getHex()}`
    },
    /**
     * 计算点坐标
    */
    calcCoordinate(objectList) {
      const ringThemeColors = ['#3BA0FF', '#37CBCB', '#4DCB73', '#FFDA6B', '#FFA200', '#F2637B', '#975FE4', '#96514D', '#E6B422', '#00A381', '#824880', '#BF794E', '#D0AF4C', '#F5B1AA', '#BC64A4'];
      let _cacheColors = [...ringThemeColors]
      let angular = 2 * Math.PI / 360 * (360 / objectList.length)
      const symbolSize = 20
      const r = 180 - symbolSize/2
      return objectList.map((it,idx) => {
        let idxAngular = angular* idx
        let angularNum = 360 / objectList.length * idx
        let x, y
        if (angularNum >=0 && angularNum <= 90) {
          x = r * Math.cos(idxAngular)
          y = r * Math.sin(idxAngular)
        } else if (angularNum > 90 && angularNum <= 180) {
          x = -r * Math.cos(idxAngular)
          y = r * Math.sin(idxAngular)
        } else if (angularNum > 180 && angularNum <= 270) {
          x = -r * Math.cos(idxAngular)
          y = -r * Math.sin(idxAngular)
        } else {
          x = r * Math.cos(idxAngular)
          y = -r * Math.sin(idxAngular)
        }
        let color = ringThemeColors[idx]
        if (!color) {
          color = this.getHexColorRandom()
          while (_cacheColors.indexOf(color) !== -1) {
            color = this.getHexColorRandom()
          }
          _cacheColors.push(color)
        }
        console.log(it.sourceName, color)
        return {
          id: it.sourceId,
          name: getStringEllipsis(it.sourceName, 10),
          _name: it.sourceName,
          symbolSize: symbolSize,
          itemStyle: {
            color
          },
          x,
          y,
          label: {
            normal: {
              show: true
            }
          }
        }
      })
    },
    // changeActive(info) {
    //   this.$refs.chart.changeHandler(info)
    // }
  }
}
</script>

<style lang="scss" scoped>

</style>
