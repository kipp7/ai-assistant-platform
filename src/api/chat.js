import request from '../utils/request'

// 获取聊天历史
export function getChatHistory() {
  return request({
    url: '/chat/history',
    method: 'get'
  })
}

// 获取特定对话
export function getConversationById(id) {
  return request({
    url: `/chat/conversation/${id}`,
    method: 'get'
  })
}

// 发送消息
export function sendMessage(assistantId, content) {
  return request({
    url: '/chat/message',
    method: 'post',
    data: {
      assistant_id: assistantId,
      content
    }
  })
}

// 删除对话
export function deleteConversation(id) {
  return request({
    url: `/chat/conversation/${id}`,
    method: 'delete'
  })
}

// 清空所有对话历史
export function clearAllConversations() {
  return request({
    url: '/chat/clear',
    method: 'delete'
  })
} 