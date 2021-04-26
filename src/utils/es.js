/* eslint-disable */
/**
 * @description: 将对象内的数组 转为 string
 * @author: 万焕昌 <1109923832@qq.com>
 * @time: 2020-11-20 13:46:42 Friday
 * @param {*} obj
 */
function transferPropertyArrayToString(obj) {
  let res = {}
  Object.keys(obj).forEach(key => {
    if (key.indexOf('_')!== 0) {
      if (Array.isArray(obj[key])) {
        res[key] = obj[key].join(',')
      } else {
        res[key] = obj[key]
      }
    }
  })
  return res
}
/**
 * 获取字符串前几位
*/
function getStringEllipsis(str, num) {
  if (!str) return ''
  return str.length > num ? str.substr(0, num - 1) + '...' : str
}

/**
 * 图表 数据 取前N位 剩下的 放到其他
 */
function arrayTopNum(data, num) {
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

function cloneDeep(v) {
  return JSON.parse(JSON.stringify(v));
}

export { transferPropertyArrayToString, getStringEllipsis, arrayTopNum, cloneDeep };
