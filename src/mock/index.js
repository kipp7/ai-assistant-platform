import Mock from 'mockjs'

import './user'
import './assistant'
import './knowledge'
import './chat'
import './dashboard'

// 设置全局延时
Mock.setup({
  timeout: '300-600'
})

export default Mock 