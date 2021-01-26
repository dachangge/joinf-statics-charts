import Vue from 'vue'
import App from './App.vue'
import './plugins/element'
import './plugins/axios'
import i18n from './lang'
import filters from './utils/filters'
import './components'
require('intersection-observer')

// 全局组件
// Object.keys(components).forEach((key) => {
//   Vue.component(key, components[key])
// })


// 全局过滤器
Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

const vueInstance = new Vue({
  render: h => h(App),
  i18n,
}).$mount('#app')


Vue.prototype.$t = Vue.prototype.$t.bind(vueInstance)
Vue.prototype.$tt = (...langs) => {
  const t = Vue.prototype.$t;
  let res = {};
  /* eslint-disable */
  for(let str of langs) {
    if (typeof str !== 'string') continue
    Object.assign(res, t(str))
  }
  return res
}
Array.prototype.$sum = function (property) {
  if (!property || this.length === 0) return 0
  return this.reduce((total, current) => {
    return total + parseFloat(current[property] || 0)
  }, 0)
}