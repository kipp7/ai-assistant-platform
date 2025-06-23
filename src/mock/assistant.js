import Mock from 'mockjs'

// 生成助手列表数据
const assistantList = []
for (let i = 1; i <= 10; i++) {
  assistantList.push({
    id: i,
    name: Mock.Random.ctitle(2, 5) + '助手',
    avatar: Mock.Random.image('100x100', Mock.Random.color(), '#FFF', 'AI'),
    domain: Mock.Random.pick(['前端开发', '后端开发', '产品经理', '设计师', '数据分析', '市场营销']),
    tone: Mock.Random.pick(['专业', '友好', '幽默', '简洁']),
    description: Mock.Random.cparagraph(1, 3),
    knowledge_base_ids: Mock.Random.range(1, 5).map(() => Mock.Random.integer(1, 20)),
    created_at: Mock.Random.datetime(),
    updated_at: Mock.Random.datetime()
  })
}

// 获取所有AI助手
Mock.mock('/api/assistants', 'get', () => {
  return {
    code: 200,
    message: '获取成功',
    data: assistantList
  }
})

// 创建AI助手
Mock.mock('/api/assistants', 'post', (options) => {
  const data = JSON.parse(options.body)
  const newAssistant = {
    id: Mock.Random.integer(11, 100),
    ...data,
    avatar: data.avatar || Mock.Random.image('100x100', Mock.Random.color(), '#FFF', 'AI'),
    knowledge_base_ids: data.knowledge_base_ids || [],
    created_at: Mock.Random.datetime(),
    updated_at: Mock.Random.datetime()
  }
  
  assistantList.push(newAssistant)
  
  return {
    code: 200,
    message: '创建成功',
    data: newAssistant
  }
})

// 获取AI助手详情
Mock.mock(new RegExp('/api/assistants/\\d+$'), 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/assistants\/(\d+)/)[1])
  const assistant = assistantList.find(item => item.id === id)
  
  if (assistant) {
    return {
      code: 200,
      message: '获取成功',
      data: assistant
    }
  } else {
    return {
      code: 404,
      message: '助手不存在'
    }
  }
})

// 更新AI助手
Mock.mock(new RegExp('/api/assistants/\\d+$'), 'put', (options) => {
  const id = parseInt(options.url.match(/\/api\/assistants\/(\d+)/)[1])
  const data = JSON.parse(options.body)
  const index = assistantList.findIndex(item => item.id === id)
  
  if (index !== -1) {
    const updatedAssistant = {
      ...assistantList[index],
      ...data,
      updated_at: Mock.Random.datetime()
    }
    assistantList[index] = updatedAssistant
    
    return {
      code: 200,
      message: '更新成功',
      data: updatedAssistant
    }
  } else {
    return {
      code: 404,
      message: '助手不存在'
    }
  }
})

// 删除AI助手
Mock.mock(new RegExp('/api/assistants/\\d+$'), 'delete', (options) => {
  const id = parseInt(options.url.match(/\/api\/assistants\/(\d+)/)[1])
  const index = assistantList.findIndex(item => item.id === id)
  
  if (index !== -1) {
    const deletedAssistant = assistantList.splice(index, 1)[0]
    
    return {
      code: 200,
      message: '删除成功',
      data: deletedAssistant
    }
  } else {
    return {
      code: 404,
      message: '助手不存在'
    }
  }
})

// 上传AI助手头像
Mock.mock('/api/assistants/avatar', 'post', () => {
  return {
    code: 200,
    message: '上传成功',
    data: {
      avatar: Mock.Random.image('100x100', Mock.Random.color(), '#FFF', 'AI')
    }
  }
})

// 关联知识库到AI助手
Mock.mock(new RegExp('/api/assistants/\\d+/knowledge'), 'post', (options) => {
  const id = parseInt(options.url.match(/\/api\/assistants\/(\d+)\/knowledge/)[1])
  const { knowledge_base_ids } = JSON.parse(options.body)
  const index = assistantList.findIndex(item => item.id === id)
  
  if (index !== -1) {
    assistantList[index].knowledge_base_ids = knowledge_base_ids
    
    return {
      code: 200,
      message: '关联成功',
      data: assistantList[index]
    }
  } else {
    return {
      code: 404,
      message: '助手不存在'
    }
  }
}) 