import { defineStore } from 'pinia'
import { getKnowledgeBases, uploadKnowledgeFile, deleteKnowledgeFile } from '../api/knowledge'

export const useKnowledgeStore = defineStore('knowledge', {
  state: () => ({
    knowledgeBases: [],
    currentKnowledgeBase: null,
    loading: false
  }),
  
  getters: {
    getKnowledgeBaseById: (state) => (id) => {
      return state.knowledgeBases.find(kb => kb.id === parseInt(id))
    }
  },
  
  actions: {
    async fetchKnowledgeBases() {
      this.loading = true
      try {
        const res = await getKnowledgeBases()
        if (res.code === 200) {
          this.knowledgeBases = res.data
        }
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },
    
    async uploadFile(data) {
      this.loading = true
      try {
        const res = await uploadKnowledgeFile(data)
        if (res.code === 200) {
          // 如果是新知识库，添加到列表中
          if (!this.knowledgeBases.some(kb => kb.id === res.data.file_id)) {
            this.knowledgeBases.push({
              id: res.data.file_id,
              filename: res.data.filename,
              size: res.data.size,
              indexed: res.data.indexed
            })
          }
        }
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },
    
    async deleteFile(id) {
      this.loading = true
      try {
        const res = await deleteKnowledgeFile(id)
        if (res.code === 200) {
          this.knowledgeBases = this.knowledgeBases.filter(kb => kb.id !== parseInt(id))
        }
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    }
  }
}) 