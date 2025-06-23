import Mock from 'mockjs'

// 登录接口
Mock.mock('/api/user/login', 'post', (options) => {
  const { username, password } = JSON.parse(options.body)
  
  if (username === 'admin' && password === '123456') {
    return {
      code: 200,
      message: '登录成功',
      data: {
        token: 'mock-token-' + Date.now(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).getTime()
      }
    }
  } else {
    return {
      code: 401,
      message: '用户名或密码错误'
    }
  }
})

// 注册接口
Mock.mock('/api/user/register', 'post', (options) => {
  const { username, password, email } = JSON.parse(options.body)
  
  if (username && password && email) {
    return {
      code: 200,
      message: '注册成功',
      data: {
        id: Mock.Random.id(),
        username,
        email,
        created_at: Mock.Random.datetime()
      }
    }
  } else {
    return {
      code: 400,
      message: '注册信息不完整'
    }
  }
})

// 获取用户信息
Mock.mock('/api/user/info', 'get', () => {
  return {
    code: 200,
    message: '获取成功',
    data: {
      id: Mock.Random.id(),
      username: 'admin',
      email: 'admin@example.com',
      avatar: Mock.Random.image('100x100', '#50B347', '#FFF', 'Avatar'),
      role: 'admin',
      created_at: Mock.Random.datetime()
    }
  }
})

// 更新用户信息
Mock.mock('/api/user/info', 'put', (options) => {
  const data = JSON.parse(options.body)
  
  return {
    code: 200,
    message: '更新成功',
    data: {
      ...data,
      updated_at: Mock.Random.datetime()
    }
  }
})

// 修改密码
Mock.mock('/api/user/password', 'put', () => {
  return {
    code: 200,
    message: '密码修改成功'
  }
})

// 上传头像
Mock.mock('/api/user/avatar', 'post', () => {
  return {
    code: 200,
    message: '头像上传成功',
    data: {
      avatar: Mock.Random.image('100x100', '#50B347', '#FFF', 'Avatar')
    }
  }
}) 