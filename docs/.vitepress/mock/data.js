import Mock from 'mockjs'
import qs from 'qs'
import { genPhone } from './utils'

// 获取 mock.Random 对象
const Random = Mock.Random

export const getList = function (options = {}) {
  let body = {}
  if (options.type.toLowerCase() === 'get') {
    body = qs.parse(options.url.split('?')[1])
  } else {
    body = qs.parse(options.body)
  }
  const arr = []
  const pageSize = body.pageSize ? Number(body.pageSize) : 10
  for (let i = 0; i < pageSize; i++) {
    const obj = {
      id: i + 1,
      name: Random.cname(), // Random.cname() 随机生成一个常见的中文姓名
      phone: genPhone(), // Random.cname() 随机生成一个手机号码
      email: Random.email(), // Random.cname() 随机生成一个邮箱地址
      age: Random.integer(1, 99), //  Random.integer( min, max )
      gender: Random.cword('12'), //  Random.cword()
      // hobby: Random.csentence(26, 26), //  Random.csentence( min, max )
      // hobby: Random.csentence(5, 30), //  Random.csentence( min, max )
      hobby: Random.csentence(5, 15), //  Random.csentence( min, max )
      updateTime: Random.date() + ' ' + Random.time(), // Random.date()指示生成的日期字符串的格式, 默认为yyyy-MM-dd；Random.time() 返回一个随机的时间字符串
      img: Random.dataImage('300x250', 'mock的图片') // Random.dataImage( size, text ) 生成一段随机的 Base64 图片编码
    }
    arr.push(obj)
  }

  return {
    code: 0,
    data: {
      list: arr,
      total: 100
    }
  }
}
