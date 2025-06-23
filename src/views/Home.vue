<template>
  <div class="home-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="18">
        <el-card class="welcome-card">
          <template #header>
            <div class="welcome-header">
              <h2>欢迎使用AI助手管理平台</h2>
              <el-button type="primary" @click="createAssistant">创建助手</el-button>
            </div>
          </template>
          <div class="welcome-content">
            <p>通过本平台，您可以：</p>
            <ul>
              <li>创建和定制多个AI助手，设置专业领域和回复风格</li>
              <li>上传知识库文件，为AI助手提供专业知识支持</li>
              <li>与AI助手进行对话，获取智能回复</li>
              <li>查看使用数据分析，了解助手表现</li>
            </ul>
          </div>
        </el-card>
        
        <el-card class="assistant-card">
          <template #header>
            <div class="card-header">
              <h3>我的AI助手</h3>
              <el-button type="text" @click="viewAllAssistants">查看全部</el-button>
            </div>
          </template>
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="assistants.length === 0" class="empty-container">
            <el-empty description="暂无AI助手，快去创建一个吧！">
              <el-button type="primary" @click="createAssistant">创建助手</el-button>
            </el-empty>
          </div>
          <div v-else class="assistant-list">
            <el-row :gutter="24">
              <el-col v-for="assistant in assistants.slice(0, 4)" :key="assistant.id" :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
                <div class="assistant-item-wrapper">
                  <el-card class="assistant-item" shadow="hover" @click="chatWithAssistant(assistant.id)">
                    <div class="assistant-avatar">
                      <el-avatar :size="60" :src="assistant.avatar" />
                    </div>
                    <h4 :title="assistant.name">{{ assistant.name }}</h4>
                    <p class="assistant-domain">{{ assistant.domain }}</p>
                    <p class="assistant-desc" :title="assistant.description">{{ assistant.description }}</p>
                  </el-card>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
        
        <el-card class="knowledge-card">
          <template #header>
            <div class="card-header">
              <h3>知识库文件</h3>
              <el-button type="text" @click="viewAllKnowledge">查看全部</el-button>
            </div>
          </template>
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="knowledgeBases.length === 0" class="empty-container">
            <el-empty description="暂无知识库文件，快去上传一个吧！">
              <el-button type="primary" @click="uploadKnowledge">上传文件</el-button>
            </el-empty>
          </div>
          <div v-else class="knowledge-list">
            <el-table :data="knowledgeBases.slice(0, 5)" style="width: 100%">
              <el-table-column prop="filename" label="文件名" />
              <el-table-column prop="size" label="大小" width="100" />
              <el-table-column prop="indexed" label="已索引" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.indexed ? 'success' : 'info'">
                    {{ scope.row.indexed ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button type="text" size="small" @click.stop="viewKnowledge(scope.row.id)">查看</el-button>
                  <el-button type="text" size="small" @click.stop="deleteKnowledge(scope.row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <h3>使用统计</h3>
              <el-button type="text" @click="viewDashboard">详细分析</el-button>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><el-icon-user /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ assistantCount }}</div>
                <div class="stat-label">AI助手</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><el-icon-folder /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ knowledgeCount }}</div>
                <div class="stat-label">知识库文件</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><el-icon-chat-dot-round /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ conversationCount }}</div>
                <div class="stat-label">对话次数</div>
              </div>
            </div>
          </div>
        </el-card>
        
        <el-card class="recent-chat-card">
          <template #header>
            <div class="card-header">
              <h3>最近对话</h3>
              <el-button type="text" @click="viewChatHistory">查看全部</el-button>
            </div>
          </template>
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="conversations.length === 0" class="empty-container">
            <el-empty description="暂无对话历史" />
          </div>
          <div v-else class="recent-chat-list">
            <div v-for="chat in conversations.slice(0, 5)" :key="chat.id" class="chat-item" @click="viewConversation(chat.id)">
              <div class="chat-title">{{ chat.title }}</div>
              <div class="chat-time">{{ formatTime(chat.updated_at) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAssistantStore } from '../store/assistant'
import { useKnowledgeStore } from '../store/knowledge'
import { useChatStore } from '../store/chat'
import { User as ElIconUser, Folder as ElIconFolder, ChatDotRound as ElIconChatDotRound } from '@element-plus/icons-vue'

const router = useRouter()
const assistantStore = useAssistantStore()
const knowledgeStore = useKnowledgeStore()
const chatStore = useChatStore()

const loading = ref(true)
const assistants = computed(() => assistantStore.assistants)
const knowledgeBases = computed(() => knowledgeStore.knowledgeBases)
const conversations = computed(() => chatStore.conversations)

const assistantCount = computed(() => assistants.value.length)
const knowledgeCount = computed(() => knowledgeBases.value.length)
const conversationCount = computed(() => conversations.value.length)

const createAssistant = () => {
  router.push('/assistants/create')
}

const viewAllAssistants = () => {
  router.push('/assistants')
}

const chatWithAssistant = (id) => {
  router.push(`/chat/${id}`)
}

const uploadKnowledge = () => {
  router.push('/knowledge/upload')
}

const viewAllKnowledge = () => {
  router.push('/knowledge')
}

const viewKnowledge = (id) => {
  router.push(`/knowledge/${id}`)
}

const deleteKnowledge = (id) => {
  ElMessageBox.confirm('确定要删除该知识库文件吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await knowledgeStore.deleteFile(id)
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {})
}

const viewDashboard = () => {
  router.push('/dashboard')
}

const viewChatHistory = () => {
  router.push('/chat/history')
}

const viewConversation = (id) => {
  router.push(`/chat/${id}`)
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(async () => {
  try {
    await Promise.all([
      assistantStore.fetchAssistants(),
      knowledgeStore.fetchKnowledgeBases(),
      chatStore.fetchChatHistory()
    ])
  } catch (error) {
    console.error('获取数据失败', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home-container {
  padding: 20px;
  width: 100%;
}

.welcome-card {
  margin-bottom: 20px;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-header h2 {
  margin: 0;
  font-size: 20px;
}

.welcome-content {
  font-size: 14px;
  color: #606266;
}

.welcome-content ul {
  padding-left: 20px;
}

.welcome-content li {
  margin-bottom: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
}

.assistant-card,
.knowledge-card {
  margin-bottom: 20px;
}

.loading-container {
  padding: 20px 0;
}

.empty-container {
  padding: 30px 0;
}

.assistant-list {
  margin-bottom: 10px;
}

.assistant-item-wrapper {
  padding: 8px;
  box-sizing: border-box;
}

.assistant-item {
  height: auto;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 0;
}

.assistant-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.assistant-avatar {
  margin-bottom: 10px;
}

.assistant-item h4 {
  margin: 10px 0 5px;
  font-size: 16px;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.assistant-domain {
  color: #409EFF;
  font-size: 12px;
  margin: 0 0 10px;
  text-align: center;
  width: 100%;
}

.assistant-desc {
  color: #606266;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-align: center;
  width: 100%;
  margin: 0;
  line-height: 1.5;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  padding: 10px 0;
}

.stat-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ecf5ff;
  color: #409EFF;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  margin-right: 15px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.recent-chat-list {
  padding: 10px 0;
}

.chat-item {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s;
}

.chat-item:hover {
  background-color: #f5f7fa;
}

.chat-item:last-child {
  border-bottom: none;
}

.chat-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .assistant-item {
    height: auto;
  }
}
</style> 