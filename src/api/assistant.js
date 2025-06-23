import request from '../utils/request'

// 获取所有AI助手
export function getAssistants() {
  return request({
    url: '/assistants',
    method: 'get'
  })
}

// 创建AI助手
export function createAssistant(data) {
  return request({
    url: '/assistants',
    method: 'post',
    data
  })
}

// 获取AI助手详情
export function getAssistantById(id) {
  return request({
    url: `/assistants/${id}`,
    method: 'get'
  })
}

// 更新AI助手
export function updateAssistant(id, data) {
  return request({
    url: `/assistants/${id}`,
    method: 'put',
    data
  })
}

// 删除AI助手
export function deleteAssistant(id) {
  return request({
    url: `/assistants/${id}`,
    method: 'delete'
  })
}

// 上传AI助手头像
export function uploadAssistantAvatar(data) {
  return request({
    url: '/assistants/avatar',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

// 关联知识库到AI助手
export function linkKnowledgeBase(assistantId, knowledgeBaseIds) {
  return request({
    url: `/assistants/${assistantId}/knowledge`,
    method: 'post',
    data: { knowledge_base_ids: knowledgeBaseIds }
  })
} 