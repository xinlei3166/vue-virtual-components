import type { Request, Response, Config } from '@/types'
import { requests } from './base'

export function getList(config?: Config): Promise<Response> {
  return requests.get('/api/mock/data/list', config)
}
