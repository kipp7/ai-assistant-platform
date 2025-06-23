import Mock from 'mockjs'

// 生成对话历史数据
const conversationList = []
for (let i = 1; i <= 10; i++) {
  conversationList.push({
    id: i,
    assistant_id: Mock.Random.integer(1, 10),
    title: Mock.Random.ctitle(5, 15),
    last_message: Mock.Random.csentence(5, 20),
    created_at: Mock.Random.datetime(),
    updated_at: Mock.Random.datetime()
  })
}

// 生成对话消息
function generateMessages(conversation_id) {
  const messages = []
  const messageCount = Mock.Random.integer(3, 10)
  
  for (let i = 0; i < messageCount; i++) {
    const isUser = i % 2 === 0
    messages.push({
      id: Mock.Random.id(),
      conversation_id,
      role: isUser ? 'user' : 'assistant',
      content: isUser ? Mock.Random.csentence(10, 30) : Mock.Random.cparagraph(1, 3),
      sources: !isUser ? (Mock.Random.boolean() ? [{
        file_id: Mock.Random.integer(1, 20),
        page: Mock.Random.integer(1, 100)
      }] : []) : [],
      timestamp: Mock.Random.datetime()
    })
  }
  
  return messages
}

// 获取聊天历史
Mock.mock('/api/chat/history', 'get', () => {
  return {
    code: 200,
    message: '获取成功',
    data: conversationList
  }
})

// 获取特定对话
Mock.mock(new RegExp('/api/chat/conversation/\\d+$'), 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/chat\/conversation\/(\d+)/)[1])
  const conversation = conversationList.find(item => item.id === id)
  
  if (conversation) {
    return {
      code: 200,
      message: '获取成功',
      data: {
        ...conversation,
        messages: generateMessages(id)
      }
    }
  } else {
    return {
      code: 404,
      message: '对话不存在'
    }
  }
})

// 发送消息
Mock.mock('/api/chat/message', 'post', (options) => {
  const { assistant_id, content } = JSON.parse(options.body)
  let conversation_id
  
  // 检查是否存在对话，如果不存在则创建新对话
  const existingConversation = conversationList.find(item => item.assistant_id === assistant_id)
  if (existingConversation) {
    conversation_id = existingConversation.id
    existingConversation.last_message = content
    existingConversation.updated_at = Mock.Random.datetime()
  } else {
    conversation_id = conversationList.length + 1
    const newConversation = {
      id: conversation_id,
      assistant_id,
      title: content.slice(0, 20) + (content.length > 20 ? '...' : ''),
      last_message: content,
      created_at: Mock.Random.datetime(),
      updated_at: Mock.Random.datetime()
    }
    conversationList.unshift(newConversation)
  }
  
  // 生成AI回复
  const response = {
    content: Mock.Random.cparagraph(1, 3),
    sources: Mock.Random.boolean() ? [{
      file_id: Mock.Random.integer(1, 20),
      page: Mock.Random.integer(1, 100)
    }] : [],
    conversation_id
  }
  
  return {
    code: 200,
    message: '发送成功',
    data: response
  }
})

// 删除对话
Mock.mock(new RegExp('/api/chat/conversation/\\d+$'), 'delete', (options) => {
  const id = parseInt(options.url.match(/\/api\/chat\/conversation\/(\d+)/)[1])
  const index = conversationList.findIndex(item => item.id === id)
  
  if (index !== -1) {
    const deletedConversation = conversationList.splice(index, 1)[0]
    
    return {
      code: 200,
      message: '删除成功',
      data: deletedConversation
    }
  } else {
    return {
      code: 404,
      message: '对话不存在'
    }
  }
})

// 清空所有对话历史
Mock.mock('/api/chat/clear', 'delete', () => {
  conversationList.length = 0
  
  return {
    code: 200,
    message: '清空成功'
  }
}) 