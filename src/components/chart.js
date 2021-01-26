/* eslint-disable */
/**
 * @module components/chart
 * @author 万焕昌 <1109923832@qq.com>
 * @desc 自定义图标
 * @example 使用方式查看 v-charts官方文档 https://v-charts.js.org/
 */
// import 'echarts/lib/chart/line'
// import 'echarts/lib/chart/pie'
// import 'echarts/lib/chart/funnel'
// import 'echarts/lib/chart/pictorialBar'
// import 'echarts/lib/component/dataZoom'

import { bar, histogram } from 'vCharts/packages/bar/main'
import { line } from 'vCharts/packages/line/main'
import { pie, ring } from 'vCharts/packages/pie/main'
import { funnel } from 'vCharts/packages/funnel/main'
// import { graph } from 'vCharts/packages/graph/main'
// import { radar } from 'vCharts/packages/radar/main'
// import { waterfall } from 'vCharts/packages/waterfall/main'
import Core from './chart_core'
export default Object.assign({}, Core, {
  name: 'chart',
  data () {
    this.chartLib = {
      bar,
      histogram,
      line,
      pie,
      ring,
      funnel,
      pictorialBar: histogram,
      // radar,
      // waterfall
    }
    this.chartHandler = this.chartLib[this.settings.type]
    return {
      loading: false
    }
  }
})



/**
 * 这样使用会有风险，但较为简单，
 * 所以在package.json 中 限制了 v-charts 插件的版本
 * 防止自动更新 导致的问题
*/

// export default Object.assign({}, vCharts, {
//   name: 'chart',
//   mounted() {
    
//   },
//   // 扩展操作 TODO
//   methods: {
//     // 实现 滚动加载
//     initProxy() {
      
//     }
//   }
// })
