import { defineStore } from 'pinia'
import { login, register, getUserInfo } from '../api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null,
    isLoggedIn: false
  }),
  
  getters: {
    username: (state) => state.userInfo?.username || '',
    avatar: (state) => state.userInfo?.avatar || ''
  },
  
  actions: {
    async loginAction(loginData) {
      try {
        const res = await login(loginData)
        if (res.code === 200) {
          this.token = res.data.token
          this.isLoggedIn = true
          localStorage.setItem('token', res.data.token)
          await this.getUserInfoAction()
          return Promise.resolve(res)
        }
        return Promise.reject(res)
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    async registerAction(registerData) {
      try {
        const res = await register(registerData)
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    async getUserInfoAction() {
      try {
        const res = await getUserInfo()
        if (res.code === 200) {
          this.userInfo = res.data
          return Promise.resolve(res)
        }
        return Promise.reject(res)
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    logoutAction() {
      this.token = ''
      this.userInfo = null
      this.isLoggedIn = false
      localStorage.removeItem('token')
    }
  },
  
  persist: {
    paths: ['token', 'isLoggedIn'],
  }
}) 