import Mock from 'mockjs'

export const genRegexpValue = (regexp) => Mock.mock({ regexp }).regexp

export const genPhone = () => genRegexpValue(/1\d{10}/)
