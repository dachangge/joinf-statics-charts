/**
 * 邮件模块API 接口
 */
import axios from '@/plugins/axios'

export default {
  /**
   * 邮件 收发趋势
   */
  getEmailSendAndRecTrend(params) {
    return axios.get('b/email/sendAndRecTrend', { params })
  },
  /**
   * 邮件 分布
   */
  getEmailDistribution(params) {
    return axios.get('b/email/distributed', { params })
  },
  /**
   * 邮件 恢复状态
   */
  getEmailReplyStatus(params) {
    return axios.get('b/email/replyStatus', { params })
  },
  /**
   * 发件追踪
   */
  getEmailSendTracking(params) {
    return axios.get('b/email/sendTrack', { params })
  }
}
