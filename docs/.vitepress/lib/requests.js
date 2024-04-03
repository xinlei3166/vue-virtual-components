import axios from 'axios'
import { message } from 'ant-design-vue'

const createRequests = (requestsConfig) => {
  const baseURL = requestsConfig.baseURL || import.meta.env.VITE_API_URL
  const AuthorizationKey = requestsConfig.AuthorizationKey || 'Access-Token'
  const errorCodes = requestsConfig.errorCodes || [401]
  const codeKey = requestsConfig.codeKey || 'code'
  const messageKey = requestsConfig.messageKey || 'message'
  const successCode = requestsConfig.successCode || 0
  const errorHandler = requestsConfig.errorHandler

  const service = axios.create({
    baseURL,
    // timeout: 60 * 1000 * 5,
    withCredentials: true, // 允许携带cookie
    headers: {
      // 'Content-Type': 'application/x-www-form-urlencoded',
      // Authorization: 'token',
      'Content-Type': 'application/json'
    },
    requestOptions: {
      withRequestId: false,
      responseType: 'json', // json, blob
      fileName: undefined
    }
  })

  // request 拦截器
  service.interceptors.request.use(
    async config => {
      // config.data = qs.stringify(config.data)
      config.headers = config.headers || {}
      // const token = getToken()
      // if (token) {
      //   config.headers[AuthorizationKey] = token
      // }
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  // response 拦截器
  service.interceptors.response.use(
    (response) => {
      const { responseType } = response?.config?.requestOptions || {}
      if (responseType === 'raw') return response
      if (responseType === 'blob') return response.data
      const { [codeKey]: code, [messageKey]: msg } = response?.data || {}
      if (code && errorCodes.includes(code)) {
        // message.error(msg)
        // router.push('/login')
        errorHandler?.(msg)
        return response.data
      }
      if (code && code !== successCode) {
        message.destroy()
        message.error(msg)
      }
      return response?.data
    },
    error => {
      // if (error && error.response) {
      //   error.message = httpMsg[error.response.status] || httpMsg.errorMsg
      // }
      if (error.message) {
        message.destroy()
        message.error(error.message)
      }
      return Promise.reject(error)
    }
  )

  const request = (config) =>
    service
      .request(config)
      .then(res => res)
      .catch(e => console.log(e))

  const get = (url, ...args) =>
    service
      .get(url, ...args)
      .then(res => res)
      .catch(e => console.log(e))

  const post = (url, ...args) =>
    service
      .post(url, ...args)
      .then(res => res)
      .catch(e => console.log(e))

  const put = (url, ...args) =>
    service
      .put(url, ...args)
      .then(res => res)
      .catch(e => console.log(e))

  const patch = (url, ...args) =>
    service
      .patch(url, ...args)
      .then(res => res)
      .catch(e => console.log(e))

  const _delete = (url, ...args) =>
    service
      .delete(url, ...args)
      .then(res => res)
      .catch(e => console.log(e))

  return { request, get, post, put, patch, delete: _delete }
}

export const useRequests = createRequests
