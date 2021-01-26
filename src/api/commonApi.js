/**
 * 公共服务API 接口
 * a 基础服务
 * b 和tms 相关的服务
 */
import axios from '@/plugins/axios'

export default {
  /**
   * 获取用户信息
   */
  getUserInfo() {
    return axios.get('a/user/operator/login')
  },
  /**
   * 获取权限码列表
   */
  getPermissionList() {
    return axios.get('b/permit/resources')
  },
  /**
   * 获取 模块权限字段
   */
  getFieldPermission() {
    return axios.get('b/permit/field')
  },
  /**
   * 获取客户搜搜  --- 过滤字段值
   */
  getDataBaseValue() {
    return axios.get('b/filter/dict/dataBaseValueAll')
  },
  /**
   * 获取客户标签
   */
  getCustomerTags() {
    return axios.get('b/filter/tags')
  },
  /**
   * 获取 业务员信息--列表
   * type: 0:不包含自己 1:包含自己
   * manager: 0:查询管理范围内 1:查询所有
   */
  getOperatorList(params) {
    return axios.get('b/filter/operators', { params })
  },
  /**
   * 获取 业务员信息--表格
   * type: 0:不包含自己 1:包含自己
   * manager: 0:查询管理范围内 1:查询所有
   */
  getOperatorsTree(params) {
    return axios.get('b/filter/operators/tree', { params })
  },
  /**
   * 获取 产品分组
   * type:[1] 个人;[0] 公司
   */
  getProductsGroup(params) {
    return axios.get('b/product/product/group', { params })
  },
  /**
   * 获取 产品列表
   * type:[1] 个人;[0] 公司
   * key: String  查询关键字
   * num: 第几页
   * size: 每页几条
   * groupId：分组id
   * paging：是否需要分页
   */
  getProducts(params) {
    return axios.get('b/product/products', { params })
  },
  // 保存过滤字段的排序设置
  postFilterSetting(data) {
    return axios.post('b/filter/setting', data)
  },
  // 查询过滤字段的排序设置
  getFilterSettings() {
    return axios.get('b/filter/setting')
  },
  /**
   * @description: 获取最小日期（客户/邮件）
   * @author: 万焕昌 <1109923832@qq.com>
   * @time: 2020-12-02 11:04:57 Wednesday
   */
  getFilterStaMinDate() {
    return axios.get('b/filter/staMinDate')
  }
}
