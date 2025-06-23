<template>
  <div class="assistant-list-container">
    <div class="page-header">
      <h2>AI助手管理</h2>
      <el-button type="primary" @click="createAssistant">创建助手</el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else-if="assistants.length === 0" class="empty-container">
      <el-empty description="暂无AI助手，快去创建一个吧！">
        <el-button type="primary" @click="createAssistant">创建助手</el-button>
      </el-empty>
    </div>
    
    <div v-else class="assistant-list">
      <el-row :gutter="20">
        <el-col v-for="assistant in assistants" :key="assistant.id" :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-card class="assistant-card" shadow="hover">
            <div class="assistant-header">
              <el-avatar :size="60" :src="assistant.avatar" />
              <h3>{{ assistant.name }}</h3>
              <div class="assistant-domain">{{ assistant.domain }}</div>
            </div>
            <div class="assistant-content">
              <p class="assistant-desc">{{ assistant.description }}</p>
              <div class="assistant-info">
                <div class="info-item">
                  <span class="label">风格:</span>
                  <span class="value">{{ assistant.tone }}</span>
                </div>
                <div class="info-item">
                  <span class="label">知识库:</span>
                  <span class="value">{{ assistant.knowledge_base_ids.length }}个</span>
                </div>
                <div class="info-item">
                  <span class="label">创建时间:</span>
                  <span class="value">{{ formatDate(assistant.created_at) }}</span>
                </div>
              </div>
            </div>
            <div class="assistant-actions">
              <el-button type="primary" @click="chatWithAssistant(assistant.id)">对话</el-button>
              <el-button type="default" @click="viewDetail(assistant.id)">详情</el-button>
              <el-dropdown trigger="click">
                <el-button type="text">
                  <el-icon><el-icon-more /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="editAssistant(assistant.id)">编辑</el-dropdown-item>
                    <el-dropdown-item @click="confirmDelete(assistant.id)" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAssistantStore } from '../../store/assistant'
import { More as ElIconMore } from '@element-plus/icons-vue'

const router = useRouter()
const assistantStore = useAssistantStore()

const loading = ref(true)
const assistants = computed(() => assistantStore.assistants)

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
  padding: 20px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.loading-container,
.empty-container {
  padding: 40px 0;
}

.assistant-card {
  margin-bottom: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.assistant-header {
  text-align: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.assistant-header h3 {
  margin: 10px 0 5px;
  font-size: 18px;
  color: #303133;
}

.assistant-domain {
  font-size: 12px;
  color: #409EFF;
  margin-bottom: 10px;
}

.assistant-content {
  flex: 1;
  padding: 15px 0;
}

.assistant-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.assistant-info {
  font-size: 13px;
}

.info-item {
  display: flex;
  margin-bottom: 5px;
}

.info-item .label {
  color: #909399;
  width: 70px;
}

.info-item .value {
  color: #606266;
  flex: 1;
}

.assistant-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .assistant-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 