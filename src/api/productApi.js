/**
 * 产品模块API 接口
 */
import axios from '@/plugins/axios'

export default {
  /**
   * 获取产品信息
   * @param dimension 维度 按产品: 2 ;按产品分组: 1
   * @param reportType 销售排行 1 ； 销售趋势 ：2 类别占比： 3
   */
  getProductsInfo(params) {
    return axios.get('b/product/getByProduct', { params })
  },
  /**
   * 类比占比
   * @param dimension 维度 按产品: 2 ;按产品分组: 1
   */
  getByProductDistribution(params) {
    return axios.get('b/product/getByProductDistribution', { params })
  },
  /**
   * 报价排行
   */
  getByProductQuoteDis(params) {
    return axios.get('b/product/getByProductQuoteDis', { params })
  },
}
