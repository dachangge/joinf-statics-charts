/**
 * 订单模块API 接口
 */
import axios from '@/plugins/axios'

export default {
  /**
   * 订单趋势
   * @param orderStatus 订单状态 完成 1；草稿 3；审批 6；待批 7；执行 8；
   */
  getOrderTendency(params) {
    return axios.get('b/order/getOrderTendency', { params })
  },
  /**
   * 订单分布
   * @param orderStatus 订单状态 完成 1；草稿 3；审批 6；待批 7；执行 8；
   */
  getByOrder(params) {
    return axios.get('b/order/getByOrder', { params })
  }
}
