/**
 * 报价模块API 接口
 */
import axios from '@/plugins/axios'

export default {
  /**
   * 获取报价信息
   * @param dimension 维度 1 业务员， 2 国家地区，3 客户名称，4 主营产品，5 客户来源， 6 产品分组 ,7 产品名称
   * @param quoteStatus 报价状态 完成 1；草稿 3；审批 6；待批 7；执行 8；
   */
  getQuoteInfo(params) {
    return axios.get('b/quote/getByQuote', { params })
  },
  /**
   * 报价转化分析
   */
  transformationAnalysis(params) {
    return axios.get('b/quote/transformationAnalysis', { params })
  },
}
