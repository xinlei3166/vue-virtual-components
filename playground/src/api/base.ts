import { message } from 'ant-design-vue'
// import router from '@/router'
import { useRequests } from '@/lib/requests'

const errorHandler = (msg: string) => {
  // removeToken()
  message.destroy()
  message.error(msg)
  // setTimeout(() => {
  //   router.push('/login')
  // }, 50)
}

const baseURL = import.meta.env.VITE_API_URL
export const requests = useRequests({ baseURL, errorHandler })
