import { defineStore } from 'pinia'
import { getAssistants, createAssistant, getAssistantById, updateAssistant, deleteAssistant } from '../api/assistant'

export const useAssistantStore = defineStore('assistant', {
  state: () => ({
    assistants: [],
    currentAssistant: null,
    loading: false
  }),
  
  getters: {
    getAssistantById: (state) => (id) => {
      return state.assistants.find(assistant => assistant.id === parseInt(id))
    }
  },
  
  actions: {
    async fetchAssistants() {
      this.loading = true
      try {
        const res = await getAssistants()
        if (res.code === 200) {
          this.assistants = res.data
        }
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },
    
    async fetchAssistantById(id) {
      this.loading = true
      try {
        const res = await getAssistantById(id)
        if (res.code === 200) {
          this.currentAssistant = res.data
        }
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },
    
    async createAssistant(data) {
      this.loading = true
      try {
        const res = await createAssistant(data)
        if (res.code === 200) {
          this.assistants.push(res.data)
        }
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },
    
    async updateAssistant(id, data) {
      this.loading = true
      try {
        const res = await updateAssistant(id, data)
        if (res.code === 200) {
          const index = this.assistants.findIndex(item => item.id === parseInt(id))
          if (index !== -1) {
            this.assistants[index] = res.data
          }
          this.currentAssistant = res.data
        }
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },
    
    async deleteAssistant(id) {
      this.loading = true
      try {
        const res = await deleteAssistant(id)
        if (res.code === 200) {
          this.assistants = this.assistants.filter(item => item.id !== parseInt(id))
          if (this.currentAssistant && this.currentAssistant.id === parseInt(id)) {
            this.currentAssistant = null
          }
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