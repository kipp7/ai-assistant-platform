<template>
  <div class="assistant-list-container">
    <div class="page-header">
      <div class="header-content">
        <h2>AI助手管理</h2>
        <p class="header-description">创建和管理您的专属AI助手，打造智能对话体验</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="createAssistant" class="create-button">
          <el-icon><el-icon-plus /></el-icon>创建助手
        </el-button>
        <el-button @click="showTemplates" class="template-button">
          <el-icon><el-icon-files /></el-icon>使用模板
        </el-button>
      </div>
    </div>
    
    <div class="filter-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索助手名称或描述"
        class="search-input"
        clearable
        @clear="handleSearch"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><el-icon-search /></el-icon>
        </template>
      </el-input>
      
      <el-select
        v-model="domainFilter"
        placeholder="专业领域"
        clearable
        @change="handleFilter"
      >
        <el-option label="全部领域" value="" />
        <el-option label="前端开发" value="前端开发" />
        <el-option label="后端开发" value="后端开发" />
        <el-option label="产品经理" value="产品经理" />
        <el-option label="设计师" value="设计师" />
        <el-option label="数据分析" value="数据分析" />
        <el-option label="市场营销" value="市场营销" />
      </el-select>
      
      <el-select
        v-model="sortOption"
        placeholder="排序方式"
        @change="handleSort"
      >
        <el-option label="创建时间 (最新)" value="created_desc" />
        <el-option label="创建时间 (最早)" value="created_asc" />
        <el-option label="名称 (A-Z)" value="name_asc" />
        <el-option label="名称 (Z-A)" value="name_desc" />
      </el-select>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else-if="filteredAssistants.length === 0" class="empty-container">
      <el-empty :description="emptyDescription">
        <el-button type="primary" @click="createAssistant">创建助手</el-button>
      </el-empty>
    </div>
    
    <div v-else class="assistant-list">
      <el-row :gutter="24">
        <el-col v-for="assistant in filteredAssistants" :key="assistant.id" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <div class="assistant-card-wrapper">
            <el-card class="assistant-card" shadow="hover">
              <div class="assistant-avatar">
                <el-avatar :size="64" :src="assistant.avatar" />
              </div>
              <div class="assistant-header">
                <h3>{{ assistant.name }}</h3>
                <el-tag size="small" class="domain-tag">{{ assistant.domain }}</el-tag>
              </div>
              <div class="assistant-content">
                <p class="assistant-desc">{{ assistant.description }}</p>
                <div class="assistant-info">
                  <div class="info-item">
                    <el-icon><el-icon-magic-stick /></el-icon>
                    <span>风格: {{ assistant.tone }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><el-icon-files /></el-icon>
                    <span>知识库: {{ assistant.knowledge_base_ids.length }}个</span>
                  </div>
                  <div class="info-item">
                    <el-icon><el-icon-calendar /></el-icon>
                    <span>创建于: {{ formatDate(assistant.created_at) }}</span>
                  </div>
                </div>
              </div>
              <div class="assistant-actions">
                <el-button type="primary" @click="chatWithAssistant(assistant.id)" class="action-button">
                  <el-icon><el-icon-chat-dot-round /></el-icon>对话
                </el-button>
                <el-button @click="viewDetail(assistant.id)" class="action-button">
                  <el-icon><el-icon-view /></el-icon>详情
                </el-button>
                <el-dropdown trigger="click" class="action-dropdown">
                  <el-button type="text">
                    <el-icon><el-icon-more /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="editAssistant(assistant.id)">
                        <el-icon><el-icon-edit /></el-icon>编辑
                      </el-dropdown-item>
                      <el-dropdown-item @click="duplicateAssistant(assistant)">
                        <el-icon><el-icon-document-copy /></el-icon>复制
                      </el-dropdown-item>
                      <el-dropdown-item @click="confirmDelete(assistant.id)" divided>
                        <el-icon><el-icon-delete /></el-icon>删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </div>
    
    <!-- 助手模板对话框 -->
    <el-dialog
      v-model="templateDialogVisible"
      title="选择助手模板"
      width="600px"
    >
      <div class="template-list">
        <el-row :gutter="20">
          <el-col v-for="template in assistantTemplates" :key="template.id" :span="12">
            <el-card class="template-card" @click="useTemplate(template)">
              <div class="template-icon">
                <el-icon :class="template.icon"></el-icon>
              </div>
              <h4>{{ template.name }}</h4>
              <p>{{ template.description }}</p>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAssistantStore } from '../../store/assistant'
import { 
  More as ElIconMore, 
  Plus as ElIconPlus, 
  Files as ElIconFiles,
  MagicStick as ElIconMagicStick,
  Calendar as ElIconCalendar,
  ChatDotRound as ElIconChatDotRound,
  View as ElIconView,
  Edit as ElIconEdit,
  Delete as ElIconDelete,
  Search as ElIconSearch,
  DocumentCopy as ElIconDocumentCopy
} from '@element-plus/icons-vue'

const router = useRouter()
const assistantStore = useAssistantStore()

const loading = ref(true)
const assistants = computed(() => assistantStore.assistants)
const searchQuery = ref('')
const domainFilter = ref('')
const sortOption = ref('created_desc')
const templateDialogVisible = ref(false)

// 预定义的助手模板
const assistantTemplates = [
  {
    id: 1,
    name: '前端开发助手',
    description: '专注于Vue、React等前端框架，提供代码优化和最佳实践建议',
    icon: 'el-icon-monitor',
    domain: '前端开发',
    tone: '专业',
    template: {
      name: '前端开发助手',
      domain: '前端开发',
      tone: '专业',
      description: '专注于Vue、React等前端框架技术，提供代码优化和最佳实践建议。熟悉HTML、CSS、JavaScript、TypeScript等前端技术栈，能够帮助解决开发过程中的技术难题和性能优化问题。'
    }
  },
  {
    id: 2,
    name: '后端开发助手',
    description: '擅长Node.js、Java、Python等后端技术，解决服务端开发问题',
    icon: 'el-icon-cpu',
    domain: '后端开发',
    tone: '专业',
    template: {
      name: '后端开发助手',
      domain: '后端开发',
      tone: '专业',
      description: '擅长Node.js、Java、Python等后端技术，解决服务端开发问题。熟悉数据库设计、API开发、性能优化和系统架构，能够提供高质量的技术解决方案和代码实现建议。'
    }
  },
  {
    id: 3,
    name: '产品经理助手',
    description: '协助产品规划、需求分析和用户研究，提供产品优化建议',
    icon: 'el-icon-goods',
    domain: '产品经理',
    tone: '专业',
    template: {
      name: '产品经理助手',
      domain: '产品经理',
      tone: '专业',
      description: '协助产品规划、需求分析和用户研究，提供产品优化建议。熟悉产品生命周期管理、竞品分析、用户故事编写、原型设计和产品路线图规划，帮助打造卓越的产品体验。'
    }
  },
  {
    id: 4,
    name: 'UI/UX设计助手',
    description: '提供界面设计和用户体验优化建议，紧跟设计趋势',
    icon: 'el-icon-picture',
    domain: '设计师',
    tone: '友好',
    template: {
      name: 'UI/UX设计助手',
      domain: '设计师',
      tone: '友好',
      description: '提供界面设计和用户体验优化建议，紧跟设计趋势。熟悉Figma、Sketch等设计工具，精通交互设计、视觉设计原则和设计系统构建，能够帮助创造美观且易用的产品界面。'
    }
  },
  {
    id: 5,
    name: '数据分析助手',
    description: '协助数据分析、可视化和解读，提供数据驱动决策建议',
    icon: 'el-icon-data-line',
    domain: '数据分析',
    tone: '简洁',
    template: {
      name: '数据分析助手',
      domain: '数据分析',
      tone: '简洁',
      description: '协助数据分析、可视化和解读，提供数据驱动决策建议。熟悉数据挖掘、统计分析方法和可视化工具，能够从复杂数据中提取有价值的洞察，支持业务决策和增长策略制定。'
    }
  },
  {
    id: 6,
    name: '市场营销助手',
    description: '提供营销策略、内容创作和渠道优化建议',
    icon: 'el-icon-promotion',
    domain: '市场营销',
    tone: '友好',
    template: {
      name: '市场营销助手',
      domain: '市场营销',
      tone: '友好',
      description: '提供营销策略、内容创作和渠道优化建议。熟悉数字营销、内容营销、社交媒体运营和用户增长策略，能够帮助制定有效的市场推广计划和品牌建设方案。'
    }
  }
]

// 根据筛选和排序条件过滤助手列表
const filteredAssistants = computed(() => {
  let result = [...assistants.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query)
    )
  }
  
  // 领域过滤
  if (domainFilter.value) {
    result = result.filter(item => item.domain === domainFilter.value)
  }
  
  // 排序
  switch (sortOption.value) {
    case 'created_desc':
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
    case 'created_asc':
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      break
    case 'name_asc':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'name_desc':
      result.sort((a, b) => b.name.localeCompare(a.name))
      break
  }
  
  return result
})

// 根据筛选条件显示不同的空状态描述
const emptyDescription = computed(() => {
  if (searchQuery.value || domainFilter.value) {
    return '没有找到符合条件的AI助手'
  }
  return '暂无AI助手，快去创建一个吧！'
})

const handleSearch = () => {
  // 搜索延迟处理可以在这里添加
}

const handleFilter = () => {
  // 过滤操作额外逻辑可以在这里添加
}

const handleSort = () => {
  // 排序操作额外逻辑可以在这里添加
}

const createAssistant = () => {
  router.push('/assistants/create')
}

const chatWithAssistant = (id) => {
  router.push(`/chat/${id}`)
}

const viewDetail = (id) => {
  router.push(`/assistants/${id}`)
}

const editAssistant = (id) => {
  router.push(`/assistants/${id}?edit=true`)
}

const duplicateAssistant = (assistant) => {
  const newAssistant = {
    name: `${assistant.name} (复制)`,
    domain: assistant.domain,
    tone: assistant.tone,
    description: assistant.description,
    knowledge_base_ids: [...assistant.knowledge_base_ids]
  }
  
  ElMessageBox.confirm('确定要复制该AI助手吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      await assistantStore.createAssistant(newAssistant)
      ElMessage.success('复制成功')
    } catch (error) {
      ElMessage.error(error.message || '复制失败')
    }
  }).catch(() => {})
}

const confirmDelete = (id) => {
  ElMessageBox.confirm('确定要删除该AI助手吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await assistantStore.deleteAssistant(id)
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

const showTemplates = () => {
  templateDialogVisible.value = true
}

const useTemplate = (template) => {
  router.push({
    path: '/assistants/create',
    query: { template: JSON.stringify(template.template) }
  })
  templateDialogVisible.value = false
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

onMounted(async () => {
  try {
    await assistantStore.fetchAssistants()
  } catch (error) {
    ElMessage.error('获取助手列表失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.assistant-list-container {
  width: 100%;
  height: 100%;
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.header-content h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.header-description {
  margin: 8px 0 0;
  font-size: 14px;
  color: #909399;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.create-button,
.template-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.loading-container,
.empty-container {
  padding: 40px 0;
  text-align: center;
}

.assistant-list {
  margin-bottom: 20px;
}

.assistant-card-wrapper {
  padding: 8px;
  box-sizing: border-box;
}

.assistant-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: none;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.assistant-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.assistant-avatar {
  display: flex;
  justify-content: center;
  padding: 24px 0 12px;
}

.assistant-header {
  text-align: center;
  padding: 0 16px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.assistant-header h3 {
  margin: 12px 0 8px;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.domain-tag {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
  border: none;
}

.assistant-content {
  flex: 1;
  padding: 16px;
}

.assistant-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 1.6;
}

.assistant-info {
  font-size: 13px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #606266;
}

.info-item .el-icon {
  margin-right: 8px;
  font-size: 14px;
  color: #909399;
}

.assistant-actions {
  display: flex;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.action-dropdown {
  margin-left: 8px;
}

.template-list {
  max-height: 400px;
  overflow-y: auto;
}

.template-card {
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.3s;
  height: 100%;
}

.template-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.template-icon {
  font-size: 32px;
  color: #409EFF;
  margin-bottom: 12px;
  text-align: center;
}

.template-card h4 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #303133;
}

.template-card p {
  font-size: 12px;
  color: #606266;
  margin: 0;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    margin-top: 16px;
    width: 100%;
  }
  
  .create-button,
  .template-button {
    flex: 1;
    justify-content: center;
  }
  
  .filter-bar {
    flex-direction: column;
  }
  
  .search-input {
    width: 100%;
  }
  
  .assistant-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-button {
    width: 100%;
    justify-content: center;
  }
  
  .action-dropdown {
    margin-left: 0;
    margin-top: 8px;
    display: flex;
    justify-content: center;
  }
}
</style> 