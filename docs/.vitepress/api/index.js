import { requests } from './base'

export function getList(config) {
  return requests.get('/api/mock/data/list', config)
}
