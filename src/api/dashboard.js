import request from '../utils/request'

// 获取周数据统计
export function getWeeklyStats() {
  return request({
    url: '/stats/weekly',
    method: 'get'
  })
}

// 获取助手使用情况
export function getAssistantUsage() {
  return request({
    url: '/stats/assistants',
    method: 'get'
  })
}

// 获取知识库统计
export function getKnowledgeStats() {
  return request({
    url: '/stats/knowledge',
    method: 'get'
  })
}

// 获取问题分类统计
export function getQuestionCategoryStats() {
  return request({
    url: '/stats/questions',
    method: 'get'
  })
} 