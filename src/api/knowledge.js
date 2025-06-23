import request from '../utils/request'

// 获取所有知识库
export function getKnowledgeBases() {
  return request({
    url: '/knowledge',
    method: 'get'
  })
}

// 上传知识库文件
export function uploadKnowledgeFile(data) {
  return request({
    url: '/knowledge/upload',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

// 删除知识库文件
export function deleteKnowledgeFile(id) {
  return request({
    url: `/knowledge/${id}`,
    method: 'delete'
  })
}

// 获取知识库详情
export function getKnowledgeById(id) {
  return request({
    url: `/knowledge/${id}`,
    method: 'get'
  })
}

// 更新知识库信息
export function updateKnowledgeInfo(id, data) {
  return request({
    url: `/knowledge/${id}`,
    method: 'put',
    data
  })
} 