import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig, type AxiosError } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import type { Result } from '@/types'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 是否正在刷新Token
let isRefreshing = false
// 请求队列 - 存储等待Token刷新的请求
let requestQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

// 执行队列中的请求
function processQueue(error: any = null, token: string = '') {
  requestQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  requestQueue = []
}

// 刷新Token
async function refreshTokenRequest(refreshTokenValue: string): Promise<string> {
  const response = await axios.post('/api/v1/auth/refresh', { refreshToken: refreshTokenValue })
  return response.data?.data?.accessToken || ''
}

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<Result>): any => {
    const res = response.data

    // 如果是文件下载，直接返回
    if (response.config.responseType === 'blob') {
      return response
    }

    // 业务状态码判断
    if (res.code !== 200) {
      // 401 在 error 拦截器中处理
      if (res.code !== 401) {
        ElMessage.error(res.message || '请求失败')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return res
  },
  async (error: AxiosError<Result>) => {
    console.error('响应错误:', error)

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // 处理 401 错误 - Token 过期自动刷新
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const userStore = useUserStore()
      const storedRefreshToken = userStore.refreshToken

      // 没有 refreshToken，直接跳转登录
      if (!storedRefreshToken) {
        userStore.logout()
        router.push('/login')
        return Promise.reject(error)
      }

      // 如果正在刷新Token，将请求加入队列等待
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          requestQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              resolve(service(originalRequest))
            },
            reject: (err: any) => {
              reject(err)
            }
          })
        })
      }

      isRefreshing = true

      try {
        // 尝试刷新Token
        const newToken = await refreshTokenRequest(storedRefreshToken)

        if (newToken) {
          userStore.setToken(newToken, storedRefreshToken)

          // 处理队列中的请求
          processQueue(null, newToken)

          // 重试原请求
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return service(originalRequest)
        } else {
          throw new Error('Token刷新失败')
        }
      } catch (refreshError) {
        // 刷新失败，清除队列并跳转登录
        processQueue(refreshError)
        userStore.logout()

        ElMessageBox.confirm('登录状态已过期，请重新登录', '系统提示', {
          confirmButtonText: '重新登录',
          showCancelButton: false,
          type: 'warning',
        }).then(() => {
          router.push('/login')
        })

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // 其他错误处理
    let message = '网络错误，请稍后重试'
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          // 已在上面处理
          message = '未授权，请重新登录'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        case 504:
          message = '网关超时'
          break
        default:
          message = error.response.data?.message || '请求失败'
      }
    }

    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service
