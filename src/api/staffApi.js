/**
 * 员工API 接口
 */
import axios from '@/plugins/axios'

export default {
  /**
   * 获取业绩分析图标数据
   * @param {operatorIdArray} Array[number]
   * @param dimension 维度 1 ; 员工 2; 部门 3; 公司 4
   * @param signDateStart 签约时间-开始
   * @param signDateStart 签约时间-结束
   */
  getByEmployees(params) {
    return axios.get('b/employees/getByEmployees', { params })
  },
  /**
   * 查询目标
   * @param {operatorIdArray} Array[number]
   * @param dataIds 员工或部门ID
   * @param dataType 目标类型 0 员工 ，1 部门
   * @param year 年
   */
  getEmployeesTarget(params) {
    return axios.get('b/employees/employeesTarget', { params })
  },
  /**
   * 编辑目标金额
  */
   postEmployeesTarget(data) {
     return axios.post('b/employees/employeesTarget', data);
   },
   /**
    * 查询员工pk图标
   */
   getEmployeesPk(params) {
     return axios.get('b/employees/pk', { params })
   },
   /**
    * 资源分布
   */
  getEmployeesResourceDistributed(params) {
    return axios.get('b/employees/resourceDistributed', { params })
  },
  /**
   * 转化分析
  */
  getEmployeesTransformAnalysis(params) {
    return axios.get('b/employees/transformAnalysis', { params })
  },
  /**
   * 询盘时效
  */
  getEmployeesInquiryLimit(params) {
    return axios.get('b/employees/inquiryLimit', { params })
  },
  /**
   * 员工目标完成率
  */
  getEmployeesTargetComRate(params) {
    return axios.get('b/employees/targetComRate', { params })
  }
}
