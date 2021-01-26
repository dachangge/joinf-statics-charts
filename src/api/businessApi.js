/*
 * @FilePath: /joinf-statistics-vuejs/src/api/businessApi.js
 * @description: 商机模块 api
 * @author: 万焕昌 <1109923832@qq.com>
 * @time: 2020-11-20 10:43:32 Friday
 */
import axios from '@/plugins/axios'

export default {
  /**
   * @description:商机线索--商机线索分布
   * @author: 万焕昌 <1109923832@qq.com>
   * @time: 2020-11-20 10:45:50 Friday
   * @param {*} params
   */
  getBusinessClueDistributed(params) {
    return axios.get('b/businessClue/distributed', { params })
  },
  /**
   * @description: 商机线索--商机处理时效
   * @author: 万焕昌 <1109923832@qq.com>
   * @time: 2020-11-20 15:40:29 Friday
   * @param {*} params
   */
  getBusinessClueTreatTime(params) {
    return axios.get('b/businessClue/treatTime', { params })
  },
  /**
   * @description: 商机线索--商机线索转化分析
   * @author: 万焕昌 <1109923832@qq.com>
   * @time: 2020-11-23 09:43:16 Monday
   * @param {*} params
   */
  getBusinessCluetransformation(params) {
    return axios.get('b/businessClue/transformation', { params })
  },
  /**
   * @description: 商机--商机状态分布
   * @author: 万焕昌 <1109923832@qq.com>
   * @time: 2020-11-24 11:02:58 Tuesday
   * @param {*} params
   */
  getBusinessStatusDistributed(params) {
    return axios.get('b/business/statusDistributed', { params })
  },
  /**
   * @description: 商机--商机丢单分布
   * @author: 万焕昌 <1109923832@qq.com>
   * @time: 2020-11-24 11:04:06 Tuesday
   * @param {*} params
   */
  getBusinessLostOrderCauseDis(params) {
    return axios.get('b/business/lostOrderCauseDis', { params })
  },
  /**
   * @description: 商机--商机预期成单
   * @author: 万焕昌 <1109923832@qq.com>
   * @time: 2020-11-25 09:30:38 Wednesday
   * @param {*} params
   */
  getBusinessExpectedOrder(params) {
    return axios.get('b/business/expectedOrder', { params })
  }

}
