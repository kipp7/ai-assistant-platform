import { defineStore } from 'pinia'
import { getWeeklyStats, getAssistantUsage, getKnowledgeStats } from '../api/dashboard'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    weeklyStats: null,
    assistantUsage: [],
    knowledgeStats: null,
    loading: false
  }),
  
  actions: {
    async fetchWeeklyStats() {
      this.loading = true
      try {
        const res = await getWeeklyStats()
        if (res.code === 200) {
          this.weeklyStats = res.data
        }
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },
    
    async fetchAssistantUsage() {
      this.loading = true
      try {
        const res = await getAssistantUsage()
        if (res.code === 200) {
          this.assistantUsage = res.data
        }
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },
    
    async fetchKnowledgeStats() {
      this.loading = true
      try {
        const res = await getKnowledgeStats()
        if (res.code === 200) {
          this.knowledgeStats = res.data
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