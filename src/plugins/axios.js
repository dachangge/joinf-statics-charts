import axios from 'axios'
import { globalConfig } from '@/components/index.js'
// import { Message } from 'element-ui'

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
const http = axios.create({
  // 默认post提交格式:application/json;charset=UTF-8
  // form表单提交: application/x-www-form-urlencoded;charset=UTF-8, 需要自己序列化对象qs
  /*
  transformRequest: [(data, headers) => {
    return data
  }],
  */
  // Check cross-site Access-Control
  withCredentials: true,
  // 60秒超时, 阿里云SLB默认60秒
  timeout: 50 * 1000
})

http.interceptors.request.use((config) => {
  config.baseURL = (globalConfig && globalConfig.baseUrl) || 'https://stats.rdc.joinf.com/rapi'
  // 将 get 请求中的数组值 转为 string
  if (config.method.toLowerCase() === 'get') {
    if (config.params) {
      Object.entries(config.params).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          config.params[key] = val.toString()
        }
      })
    }
  }
  return config
})
// Add a response interceptor
http.interceptors.response.use((response) => {
  // let config = response.config
  // 全局错误处理
  // 全局错误处理
  let res = response.data
  if (res.success) {
    // console.log('全局处理成功')
    // return response;
    return res;
  }
  if (res.code === '308') {
    window.location.href = res.message;
  } else if (res.code === '401' || res.code === 401) {
    // eslint-disable-next-line camelcase
    let redirect_uri = encodeURIComponent(window.location.href);// redirect_uri为当前访问的url
    /**
     *  res.data 为请求授权地址;
     *  参数redirect_uri为当前地址,用于授权成功后跳转
     * */
    // eslint-disable-next-line camelcase
    window.location.href = res.data + '?redirect_uri=' + redirect_uri
  }
  return Promise.reject(response.data || response)
}, (error) => {
  let config = error.config
  if (config.autoHandleError !== false) {
    const message = error.message || '未知错误'
    globalConfig.Message({ type: 'error', message, duration: 8000 })
  }
  return Promise.reject(error)
})

// Vue.axios = http
// Vue.prototype.axios = http
// Vue.prototype.$axios = http

export default http
