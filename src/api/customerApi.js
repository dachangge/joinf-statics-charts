/**
 * 客户模块API 接口
 */
 import axios from '@/plugins/axios'

 export default {
   /**
    * 获取客户分布
    */
   getCustomerDistributed(params) {
     return axios.get('b/customer/distributed', { params })
   },
   /**
    * 获取订单趋势
    */
   getOrderTrend(params) {
     return axios.get('b/customer/orderTrend', { params })
   },
   /**
    * 获取活跃状态
    */
   getActiveState(params) {
     return axios.get('b/customer/activeState', { params })
   },
   /**
    * 类型变动
    */
   getCustomerTypeChange(params) {
     return axios.get('b/customer/customerTypeChange', { params })
   },
   /**
    * 来源转化率
    */
   getCustomerSourceTrans(params) {
     return axios.get('b/customer/customerSourceTrans', { params })
   },
   /**
    * 过去转移路径
   */
   getCustomerTransferPath(params) {
     return axios.get('b/customer/customerTransferPath', { params })
   },
   getCustomerTransferPathDetail(params) {
     return axios.get('b/customer/customerTransferPath/detail', { params })
   },
   /**
    * @description: 查询客户名称列表
    * @author: 万焕昌 <1109923832@qq.com>
    * @time: 2020-11-24 13:11:27 Tuesday
    * @param {*} params
    */
   getCustomerName(params) {
     return axios.get('b/customer/getName', { params })
   },
   /**
    * @description: 客户--类型变动明细
    * @author: 万焕昌 <1109923832@qq.com>
    * @time: 2020-11-30 10:58:27 Monday
    * @param {*} params
    */
   getCustomerTypeChangeDetail(params) {
     return axios.get('b/customer/customerTypeChangeDetail', { params })
   },
   /**
    * @description: 获取客户未成单情况-客户名称维度
    * @author: 陈新
    * @time: 2021-03-03 15:27:08 星期三
    * @param {Object} {}
    * @return {promise}
    */
   getCustomerNotSignedCustomer(params) {
     return axios.get('b/customer/notSigned/customerName', { params })
   },
   /**
    * @description: 获取客户未成单情况-客户名称维度
    * @author: 陈新
    * @time: 2021-03-03 15:27:08 星期三
    * @param {Object} {}
    * @return {promise}
    */
   getCustomerNotSigned(params) {
     return axios.get('b/customer/notSigned', { params })
   },
   /**
    * @description 客户--有效互动
    * @param {object} params - 查询条件
    */
   getCustomerInteract(params) {
     return axios.get('b/customer/interact', { params })
   },
   /**
    * @description 客户--渠道质量
    * @param {object} params - 查询条件
    */
   getChannelQuality(params) {
     return axios.get('b/customer/channelQuality', { params })
   },
   /**
    * @description 客户--类型情况
    * @param {object} params - 查询条件
    */
   getTypeCondition(params) {
     return axios.get('b/customer/typeCondition', { params })
   },
 }
 