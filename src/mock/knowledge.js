import Mock from 'mockjs'

// 生成知识库列表数据
const knowledgeBaseList = []
for (let i = 1; i <= 20; i++) {
  knowledgeBaseList.push({
    id: i,
    filename: Mock.Random.pick([
      'Vue3深入浅出.pdf',
      'JavaScript高级编程.docx',
      'React设计模式.pdf',
      '前端性能优化.txt',
      '数据结构与算法.pdf',
      '产品需求文档.docx',
      '设计规范.pdf',
      '市场调研报告.xlsx'
    ]),
    size: Mock.Random.float(0.5, 10, 1, 1) + 'MB',
    indexed: Mock.Random.boolean(),
    tags: Mock.Random.range(1, 3).map(() => Mock.Random.pick(['前端', '后端', '设计', '产品', '算法', '数据', '营销'])),
    created_at: Mock.Random.datetime(),
    updated_at: Mock.Random.datetime()
  })
}

// 获取所有知识库
Mock.mock('/api/knowledge', 'get', () => {
  return {
    code: 200,
    message: '获取成功',
    data: knowledgeBaseList
  }
})

// 上传知识库文件
Mock.mock('/api/knowledge/upload', 'post', () => {
  const newFile = {
    file_id: Mock.Random.integer(21, 100),
    filename: Mock.Random.pick([
      'Vue3深入浅出.pdf',
      'JavaScript高级编程.docx',
      'React设计模式.pdf',
      '前端性能优化.txt',
      '数据结构与算法.pdf'
    ]),
    size: Mock.Random.float(0.5, 10, 1, 1) + 'MB',
    indexed: true
  }
  
  return {
    code: 200,
    message: '上传成功',
    data: newFile
  }
})

// 删除知识库文件
Mock.mock(new RegExp('/api/knowledge/\\d+$'), 'delete', (options) => {
  const id = parseInt(options.url.match(/\/api\/knowledge\/(\d+)/)[1])
  const index = knowledgeBaseList.findIndex(item => item.id === id)
  
  if (index !== -1) {
    const deletedFile = knowledgeBaseList.splice(index, 1)[0]
    
    return {
      code: 200,
      message: '删除成功',
      data: deletedFile
    }
  } else {
    return {
      code: 404,
      message: '文件不存在'
    }
  }
})

// 获取知识库详情
Mock.mock(new RegExp('/api/knowledge/\\d+$'), 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/knowledge\/(\d+)/)[1])
  const file = knowledgeBaseList.find(item => item.id === id)
  
  if (file) {
    return {
      code: 200,
      message: '获取成功',
      data: {
        ...file,
        content_preview: Mock.Random.cparagraph(3, 7)
      }
    }
  } else {
    return {
      code: 404,
      message: '文件不存在'
    }
  }
})

// 更新知识库信息
Mock.mock(new RegExp('/api/knowledge/\\d+$'), 'put', (options) => {
  const id = parseInt(options.url.match(/\/api\/knowledge\/(\d+)/)[1])
  const data = JSON.parse(options.body)
  const index = knowledgeBaseList.findIndex(item => item.id === id)
  
  if (index !== -1) {
    const updatedFile = {
      ...knowledgeBaseList[index],
      ...data,
      updated_at: Mock.Random.datetime()
    }
    knowledgeBaseList[index] = updatedFile
    
    return {
      code: 200,
      message: '更新成功',
      data: updatedFile
    }
  } else {
    return {
      code: 404,
      message: '文件不存在'
    }
  }
}) 