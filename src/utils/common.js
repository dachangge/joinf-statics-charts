/* eslint-disable */

import store from '../store'

export default function (Vue) {
  /**
   * 图表 数据 取前N位 剩下的 放到其他
   */
  Vue.prototype.arrayTopNum = function(data, num) {
    let otherNum = 0
    let arr = []
    data.forEach((item, index)=>{
      if (index < num) {
        arr.push(item)
      } else {
        otherNum += item.totalNum
      }
      if (index === data.length - 1 && index > num - 1) {
        arr.push({
          dimensionValue: '其他',
          dimensionValueEn: 'Other',
          totalNum: otherNum
        })
      }
    })
    return arr;
  }
}
