import requests, { Config } from '../lib/requests'

export function getData(data: Record<string, any>, config?: Config): Promise<Record<string, any>> {
  return requests.post('/api/table/data', data, config)
}
