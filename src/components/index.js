import Chart from './chart'
import ChartDimension from './chart-dimension/chartDimension'
import chartBottomDimension from './chart-bottom-dimension/chartBottomDimension.js'
const components = {
  Chart,
  ChartDimension,
  chartBottomDimension,
}
import moduleCharts from '@/components/charts/index.js'

const charts = Object.values(moduleCharts).reduce((prev, cur) => {
  prev.push(...cur)
  return prev
}, [])

let globalConfig = {
  defaultHeight: '400px'
}

const install = function (Vue, opt = {}) {
  console.log(opt)
  globalConfig.Message = opt.Message
  globalConfig.DatePicker = opt.DatePicker
  globalConfig.baseUrl = opt.baseUrl
  opt.defaultHeight && (globalConfig.defaultHeight = opt.defaultHeight)
  // 增加全局的 过滤器
  Vue.filter('timeWithoutHourSecondMinute', function (str) {
    if (!str) return '--'
    return str.substr(0, 10)
  })
  Object.keys(components).forEach((key) => {
    Vue.component(key, components[key])
  })
  // Vue.component('customerDistributionChart', customerDistributionChart)
  // Object.keys(charts).forEach(key => {
  //   Vue.component(key, charts[key])
  // })
}
export default {
  version: '0.1.0',
  install,
  charts
}
export { globalConfig }