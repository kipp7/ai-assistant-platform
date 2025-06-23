import { defineStore } from 'pinia'
import { getChatHistory, sendMessage, getConversationById } from '../api/chat'

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [],
    currentConversation: null,
    messages: [],
    loading: false
  }),
  
  getters: {
    getConversationById: (state) => (id) => {
      return state.conversations.find(conv => conv.id === parseInt(id))
    }
  },
  
  actions: {
    async fetchChatHistory() {
      this.loading = true
      try {
        const res = await getChatHistory()
        if (res.code === 200) {
          this.conversations = res.data
        }
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },
    
    async fetchConversation(id) {
      this.loading = true
      try {
        const res = await getConversationById(id)
        if (res.code === 200) {
          this.currentConversation = res.data
          this.messages = res.data.messages || []
        }
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },
    
    async sendMessage(assistantId, content) {
      this.loading = true
      try {
        // 先添加用户消息到本地状态
        const userMessage = {
          role: 'user',
          content,
          timestamp: new Date().toISOString()
        }
        this.messages.push(userMessage)
        
        const res = await sendMessage(assistantId, content)
        if (res.code === 200) {
          // 添加AI回复到本地状态
          const assistantMessage = {
            role: 'assistant',
            content: res.data.content,
            sources: res.data.sources || [],
            timestamp: new Date().toISOString()
          }
          this.messages.push(assistantMessage)
          
          // 如果是新对话，更新对话ID和列表
          if (!this.currentConversation) {
            this.currentConversation = {
              id: res.data.conversation_id,
              assistant_id: assistantId,
              title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
              last_message: content,
              updated_at: new Date().toISOString()
            }
            this.conversations.unshift(this.currentConversation)
          } else {
            // 更新现有对话的最后消息和时间
            const index = this.conversations.findIndex(c => c.id === this.currentConversation.id)
            if (index !== -1) {
              this.conversations[index].last_message = content
              this.conversations[index].updated_at = new Date().toISOString()
            }
          }
        }
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    }
  },
  
  persist: {
    paths: ['conversations'],
  }
}) 