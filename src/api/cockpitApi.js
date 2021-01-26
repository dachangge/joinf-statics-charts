/**
 * 驾驶舱相关 接口
 */
import axios from '@/plugins/axios'

export default {
  /**
   * 驾驶舱查询
  */
 getCockpitSetting() {
    return axios.get('/b/cockpit/getting');
 },
 /**
  * 驾驶舱设置
  * @param {data.cockpit} String 图表标志位,拼接
 */
 setCockpitSetting(data) {
    return axios.post('/b/cockpit/setting', data)
 },
 /**
  * 驾驶舱头信息展示
 */
 getHeadDetail(params) {
    return axios.get('/b/cockpit/getHeadDetail', { params })
 }
}
