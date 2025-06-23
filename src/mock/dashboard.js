import Mock from 'mockjs'

// 获取周数据统计
Mock.mock('/api/stats/weekly', 'get', () => {
  return {
    code: 200,
    message: '获取成功',
    data: {
      labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      datasets: [
        {
          label: '对话次数',
          data: Array.from({ length: 7 }, () => Mock.Random.integer(10, 100))
        },
        {
          label: '问题解决率',
          data: Array.from({ length: 7 }, () => Mock.Random.float(0.6, 0.95, 2, 2))
        }
      ]
    }
  }
})

// 获取助手使用情况
Mock.mock('/api/stats/assistants', 'get', () => {
  const assistants = []
  for (let i = 1; i <= 5; i++) {
    assistants.push({
      id: i,
      name: Mock.Random.ctitle(2, 5) + '助手',
      usage_count: Mock.Random.integer(50, 500),
      success_rate: Mock.Random.float(0.7, 0.98, 2, 2),
      avg_response_time: Mock.Random.float(0.5, 3, 1, 1)
    })
  }
  
  return {
    code: 200,
    message: '获取成功',
    data: assistants
  }
})

// 获取知识库统计
Mock.mock('/api/stats/knowledge', 'get', () => {
  return {
    code: 200,
    message: '获取成功',
    data: {
      total_files: Mock.Random.integer(20, 50),
      total_size: Mock.Random.float(50, 200, 1, 1) + 'MB',
      indexed_percentage: Mock.Random.float(0.8, 1, 2, 2),
      category_distribution: [
        { name: '前端开发', value: Mock.Random.integer(5, 15) },
        { name: '后端开发', value: Mock.Random.integer(5, 15) },
        { name: '产品文档', value: Mock.Random.integer(3, 10) },
        { name: '设计规范', value: Mock.Random.integer(2, 8) },
        { name: '其他', value: Mock.Random.integer(1, 5) }
      ]
    }
  }
})

// 获取问题分类统计
Mock.mock('/api/stats/questions', 'get', () => {
  return {
    code: 200,
    message: '获取成功',
    data: {
      categories: [
        { name: '技术咨询', value: Mock.Random.integer(100, 300) },
        { name: '产品使用', value: Mock.Random.integer(80, 200) },
        { name: '功能建议', value: Mock.Random.integer(50, 150) },
        { name: '错误报告', value: Mock.Random.integer(30, 100) },
        { name: '其他', value: Mock.Random.integer(20, 80) }
      ],
      top_questions: Array.from({ length: 5 }, () => ({
        question: Mock.Random.csentence(5, 15),
        count: Mock.Random.integer(10, 50)
      }))
    }
  }
}) 