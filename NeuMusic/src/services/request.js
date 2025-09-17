import axios from 'axios'

// 默认 API 地址
const DEFAULT_API_URL = 'http://139.9.223.233:3000/'

// 创建 axios 实例
const request = axios.create({
  baseURL: localStorage.getItem('apiUrl') || DEFAULT_API_URL,
  timeout: 10000,
  withCredentials: true,
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加 cookie 到请求参数
    const cookie = localStorage.getItem('cookie')
    if (cookie) {
      config.params = {
        ...config.params,
        cookie: cookie,
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { data } = response
    
    // 检查登录状态
    if (data.code === 301) {
      // 需要登录
      localStorage.removeItem('cookie')
      localStorage.removeItem('userInfo')
      window.location.reload()
      return Promise.reject(new Error('需要登录'))
    }
    
    return data
  },
  error => {
    console.error('API 请求错误:', error)
    return Promise.reject(error)
  }
)

// 设置 API 地址
export const setApiUrl = (url) => {
  request.defaults.baseURL = url
  localStorage.setItem('apiUrl', url)
}

// 获取当前 API 地址
export const getApiUrl = () => {
  return request.defaults.baseURL
}

export default request