/**
 * 全局过滤器
 * @module utils/filters
 */
module.exports = {
  hello(str) {
    return `${str} -world`
  },
  timeWithoutHourSecondMinute(str) {
    if (!str) return '--'
    return str.substr(0, 10)
  }
}
