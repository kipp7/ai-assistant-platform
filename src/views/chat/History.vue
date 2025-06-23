<template>
  <div class="chat-history-container">
    <div class="page-header">
      <h2>对话历史</h2>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else-if="chatSessions.length === 0" class="empty-container">
      <el-empty description="暂无对话历史记录">
        <el-button type="primary" @click="goToAssistants">开始对话</el-button>
      </el-empty>
    </div>
    
    <div v-else class="history-content">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部对话" name="all"></el-tab-pane>
        <el-tab-pane label="最近7天" name="recent"></el-tab-pane>
        <el-tab-pane label="已收藏" name="favorite"></el-tab-pane>
      </el-tabs>
      
      <div class="filter-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索对话内容"
          prefix-icon="el-icon-search"
          clearable
          @input="handleSearch"
        />
        
        <el-select
          v-model="selectedAssistant"
          placeholder="助手筛选"
          clearable
          @change="handleAssistantFilter"
        >
          <el-option
            v-for="assistant in assistants"
            :key="assistant.id"
            :label="assistant.name"
            :value="assistant.id"
          />
        </el-select>
      </div>
      
      <div class="session-list">
        <div 
          v-for="session in filteredSessions" 
          :key="session.id" 
          class="session-item"
          @click="viewSession(session.id)"
        >
          <div class="session-header">
            <div class="assistant-info">
              <el-avatar :size="40" :src="session.assistant.avatar" />
              <div class="assistant-meta">
                <h3>{{ session.assistant.name }}</h3>
                <div class="assistant-domain">{{ session.assistant.domain }}</div>
              </div>
            </div>
            
            <div class="session-actions">
              <el-tooltip :content="session.is_favorite ? '取消收藏' : '收藏对话'" placement="top">
                <el-button 
                  :icon="session.is_favorite ? 'el-icon-star-on' : 'el-icon-star-off'" 
                  circle
                  @click.stop="toggleFavorite(session)"
                />
              </el-tooltip>
              <el-popconfirm
                title="确定要删除此对话记录吗？"
                @confirm="deleteSession(session.id)"
              >
                <template #reference>
                  <el-button 
                    icon="el-icon-delete" 
                    circle
                    @click.stop
                  />
                </template>
              </el-popconfirm>
            </div>
          </div>
          
          <div class="session-preview">
            <p class="preview-text">{{ session.last_message || '暂无对话内容' }}</p>
          </div>
          
          <div class="session-footer">
            <div class="message-count">
              <el-icon><el-icon-chat-dot-round /></el-icon>
              <span>{{ session.message_count }}条消息</span>
            </div>
            <div class="session-time">{{ formatDate(session.last_activity) }}</div>
          </div>
        </div>
      </div>
      
      <div class="pagination-container" v-if="totalPages > 1">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="totalItems"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useChatStore } from '../../store/chat'
import { useAssistantStore } from '../../store/assistant'
import { ChatDotRound as ElIconChatDotRound } from '@element-plus/icons-vue'

const router = useRouter()
const chatStore = useChatStore()
const assistantStore = useAssistantStore()

const loading = ref(true)
const chatSessions = ref([])
const assistants = ref([])
const activeTab = ref('all')
const searchQuery = ref('')
const selectedAssistant = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)

const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

const filteredSessions = computed(() => {
  let result = [...chatSessions.value]
  
  // 根据标签筛选
  if (activeTab.value === 'recent') {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    result = result.filter(session => new Date(session.last_activity) >= sevenDaysAgo)
  } else if (activeTab.value === 'favorite') {
    result = result.filter(session => session.is_favorite)
  }
  
  // 根据搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(session => 
      session.assistant.name.toLowerCase().includes(query) || 
      (session.last_message && session.last_message.toLowerCase().includes(query))
    )
  }
  
  // 根据选中的助手筛选
  if (selectedAssistant.value) {
    result = result.filter(session => session.assistant.id === selectedAssistant.value)
  }
  
  return result
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    // 今天
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } else if (diffDays === 1) {
    // 昨天
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } else if (diffDays < 7) {
    // 一周内
    const days = ['日', '一', '二', '三', '四', '五', '六']
    return `周${days[date.getDay()]} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } else {
    // 更早
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  }
}

const handleTabClick = () => {
  currentPage.value = 1
  fetchChatSessions()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchChatSessions()
}

const handleAssistantFilter = () => {
  currentPage.value = 1
  fetchChatSessions()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchChatSessions()
}

const viewSession = (sessionId) => {
  const session = chatSessions.value.find(s => s.id === sessionId)
  if (session) {
    router.push(`/chat/${session.assistant.id}?session=${sessionId}`)
  }
}

const toggleFavorite = async (session) => {
  try {
    await chatStore.toggleSessionFavorite(session.id)
    session.is_favorite = !session.is_favorite
    ElMessage.success(session.is_favorite ? '已添加到收藏' : '已取消收藏')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const deleteSession = async (sessionId) => {
  try {
    await chatStore.deleteSession(sessionId)
    chatSessions.value = chatSessions.value.filter(session => session.id !== sessionId)
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const goToAssistants = () => {
  router.push('/assistants')
}

const fetchChatSessions = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      tab: activeTab.value,
      query: searchQuery.value,
      assistant_id: selectedAssistant.value
    }
    
    const result = await chatStore.fetchChatSessions(params)
    chatSessions.value = result.sessions
    totalItems.value = result.total
  } catch (error) {
    ElMessage.error('获取对话历史失败')
  } finally {
    loading.value = false
  }
}

const fetchAssistants = async () => {
  try {
    await assistantStore.fetchAssistants()
    assistants.value = assistantStore.assistants
  } catch (error) {
    console.error('获取助手列表失败', error)
  }
}

watch([activeTab, searchQuery, selectedAssistant], () => {
  fetchChatSessions()
}, { deep: true })

onMounted(() => {
  fetchAssistants()
  fetchChatSessions()
})
</script>

<style scoped>
.chat-history-container {
  padding: 20px 0;
}

.page-header {
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

.history-content {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.filter-bar {
  display: flex;
  gap: 15px;
  margin: 20px 0;
}

.filter-bar .el-input {
  max-width: 300px;
}

.filter-bar .el-select {
  width: 200px;
}

.session-list {
  margin-top: 20px;
}

.session-item {
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.session-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.assistant-info {
  display: flex;
  align-items: center;
}

.assistant-meta {
  margin-left: 15px;
}

.assistant-meta h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.assistant-domain {
  font-size: 12px;
  color: #409EFF;
  margin-top: 3px;
}

.session-actions {
  display: flex;
  gap: 10px;
}

.session-preview {
  margin: 10px 0;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.preview-text {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.session-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.message-count {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-bar .el-input,
  .filter-bar .el-select {
    width: 100%;
    max-width: none;
  }
}
</style> 