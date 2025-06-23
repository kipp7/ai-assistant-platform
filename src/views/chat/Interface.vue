<template>
  <div class="chat-interface-container">
    <div class="chat-header">
      <div class="assistant-info">
        <el-avatar :size="40" :src="assistant.avatar" />
        <div class="assistant-meta">
          <h3>{{ assistant.name }}</h3>
          <div class="assistant-desc">{{ assistant.domain }} · {{ assistant.tone }}风格</div>
        </div>
      </div>
      <div class="header-actions">
        <el-tooltip content="查看助手详情" placement="bottom">
          <el-button icon="el-icon-info" circle @click="viewAssistantDetail"></el-button>
        </el-tooltip>
        <el-tooltip content="返回助手列表" placement="bottom">
          <el-button icon="el-icon-back" circle @click="backToList"></el-button>
        </el-tooltip>
      </div>
    </div>
    
    <div class="chat-content" ref="chatContentRef">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
        <el-skeleton style="margin-top: 20px" :rows="3" animated />
      </div>
      
      <template v-else>
        <div v-if="messages.length === 0" class="empty-chat">
          <div class="welcome-message">
            <h2>欢迎与 {{ assistant.name }} 对话</h2>
            <p>{{ assistant.description }}</p>
            <div class="suggestion-list">
              <h4>您可以这样问我：</h4>
              <div class="suggestion-items">
                <div 
                  v-for="(suggestion, index) in suggestions" 
                  :key="index" 
                  class="suggestion-item"
                  @click="sendMessage(suggestion)"
                >
                  {{ suggestion }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="message-list">
          <div 
            v-for="(message, index) in messages" 
            :key="index"
            :class="['message-item', message.role === 'user' ? 'user-message' : 'assistant-message']"
          >
            <div class="message-avatar">
              <el-avatar 
                :size="36" 
                :src="message.role === 'user' ? userAvatar : assistant.avatar"
              />
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <div v-if="message.content" v-html="formatMessage(message.content)"></div>
                <div v-else-if="message.loading" class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
    
    <div class="chat-input">
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="2"
        placeholder="输入您的问题..."
        resize="none"
        @keydown.enter.prevent="handleEnter"
      />
      <div class="input-actions">
        <el-tooltip content="上传文件" placement="top">
          <el-button icon="el-icon-upload" circle></el-button>
        </el-tooltip>
        <el-button 
          type="primary" 
          :loading="sending" 
          @click="sendMessage()"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAssistantStore } from '../../store/assistant'
import { useChatStore } from '../../store/chat'
import { useUserStore } from '../../store/user'
import marked from 'marked'
import DOMPurify from 'dompurify'

const route = useRoute()
const router = useRouter()
const assistantStore = useAssistantStore()
const chatStore = useChatStore()
const userStore = useUserStore()

const assistantId = computed(() => route.params.id)
const assistant = ref({})
const messages = ref([])
const inputMessage = ref('')
const loading = ref(true)
const sending = ref(false)
const chatContentRef = ref(null)
const userAvatar = computed(() => userStore.userInfo.avatar || '')

// 根据助手领域生成的建议问题
const suggestions = computed(() => {
  if (!assistant.value || !assistant.value.domain) return []
  
  const domainSuggestions = {
    '前端开发': [
      'Vue 3和Vue 2有哪些主要区别？',
      '如何优化React应用的性能？',
      '请解释一下CSS Grid和Flexbox的区别'
    ],
    '后端开发': [
      'Node.js和Python在后端开发中各有什么优势？',
      '如何设计高并发系统的数据库架构？',
      '微服务和单体架构的优缺点是什么？'
    ],
    '产品经理': [
      '如何进行有效的用户需求分析？',
      '产品经理应该如何与开发团队协作？',
      '如何设计一个好的用户调研问卷？'
    ],
    '设计师': [
      '如何确保设计的一致性？',
      'UI设计的最新趋势是什么？',
      '如何进行有效的用户体验测试？'
    ],
    '数据分析': [
      '如何处理数据中的异常值？',
      '常用的数据可视化工具有哪些？',
      '如何评估机器学习模型的性能？'
    ],
    '市场营销': [
      '如何制定有效的社交媒体营销策略？',
      '内容营销的最佳实践有哪些？',
      '如何评估营销活动的ROI？'
    ]
  }
  
  return domainSuggestions[assistant.value.domain] || [
    '你能做什么？',
    '请介绍一下你自己',
    '你的专业领域是什么？'
  ]
})

const formatMessage = (content) => {
  // 使用marked转换Markdown，并用DOMPurify清理HTML
  return DOMPurify.sanitize(marked(content))
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${hours}:${minutes}`
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContentRef.value) {
      chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
    }
  })
}

const handleEnter = (e) => {
  if (!e.shiftKey) {
    sendMessage()
  }
}

const sendMessage = async (text = null) => {
  const messageContent = text || inputMessage.value.trim()
  
  if (!messageContent) return
  
  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: messageContent,
    timestamp: new Date()
  })
  
  // 添加助手消息（加载中状态）
  messages.value.push({
    role: 'assistant',
    loading: true,
    content: '',
    timestamp: new Date()
  })
  
  inputMessage.value = ''
  sending.value = true
  scrollToBottom()
  
  try {
    // 发送消息到后端
    const response = await chatStore.sendMessage({
      assistant_id: assistantId.value,
      content: messageContent
    })
    
    // 更新助手回复
    const lastIndex = messages.value.length - 1
    messages.value[lastIndex] = {
      role: 'assistant',
      content: response.content,
      timestamp: new Date()
    }
  } catch (error) {
    // 移除加载中的消息
    messages.value.pop()
    ElMessage.error('发送消息失败')
  } finally {
    sending.value = false
    scrollToBottom()
  }
}

const viewAssistantDetail = () => {
  router.push(`/assistants/${assistantId.value}`)
}

const backToList = () => {
  router.push('/assistants')
}

const fetchAssistantData = async () => {
  loading.value = true
  try {
    const data = await assistantStore.fetchAssistantById(assistantId.value)
    assistant.value = data
  } catch (error) {
    ElMessage.error('获取助手信息失败')
    router.push('/assistants')
  }
}

const fetchChatHistory = async () => {
  try {
    const history = await chatStore.fetchChatHistory(assistantId.value)
    messages.value = history.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp)
    }))
  } catch (error) {
    console.error('获取聊天历史失败', error)
  } finally {
    loading.value = false
  }
}

watch(messages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(async () => {
  await fetchAssistantData()
  await fetchChatHistory()
  scrollToBottom()
})
</script>

<style scoped>
.chat-interface-container {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fff;
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

.assistant-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 3px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f7fa;
}

.loading-container {
  padding: 20px;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.welcome-message {
  text-align: center;
  max-width: 600px;
}

.welcome-message h2 {
  margin-bottom: 10px;
  color: #303133;
}

.welcome-message p {
  color: #606266;
  margin-bottom: 30px;
}

.suggestion-list h4 {
  margin-bottom: 15px;
  color: #606266;
}

.suggestion-items {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.suggestion-item {
  background-color: #ecf5ff;
  color: #409EFF;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.suggestion-item:hover {
  background-color: #409EFF;
  color: #fff;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-item {
  display: flex;
  max-width: 80%;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.assistant-message {
  align-self: flex-start;
}

.message-avatar {
  margin: 0 10px;
}

.message-content {
  display: flex;
  flex-direction: column;
}

.user-message .message-content {
  align-items: flex-end;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 100%;
  word-break: break-word;
}

.user-message .message-bubble {
  background-color: #409EFF;
  color: #fff;
  border-top-right-radius: 0;
}

.assistant-message .message-bubble {
  background-color: #fff;
  color: #303133;
  border-top-left-radius: 0;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  margin: 0 2px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

.chat-input {
  padding: 15px 20px;
  background-color: #fff;
  border-top: 1px solid #ebeef5;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 10px;
  gap: 10px;
}

/* 自定义markdown样式 */
.message-bubble :deep(p) {
  margin: 0 0 10px;
}

.message-bubble :deep(p:last-child) {
  margin-bottom: 0;
}

.message-bubble :deep(code) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.user-message .message-bubble :deep(code) {
  background-color: rgba(255, 255, 255, 0.2);
}

.message-bubble :deep(pre) {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 10px 0;
}

.user-message .message-bubble :deep(pre) {
  background-color: rgba(255, 255, 255, 0.1);
}

.message-bubble :deep(ul), .message-bubble :deep(ol) {
  padding-left: 20px;
  margin: 10px 0;
}

@media (max-width: 768px) {
  .message-item {
    max-width: 90%;
  }
  
  .chat-interface-container {
    height: calc(100vh - 100px);
  }
}
</style> 