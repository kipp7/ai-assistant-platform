<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <img src="../assets/logo.png" alt="AI助手平台" class="logo-img" />
        <h1 class="logo-text">AI助手平台</h1>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><el-icon-house /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/assistants">
          <el-icon><el-icon-user /></el-icon>
          <span>AI助手管理</span>
        </el-menu-item>
        <el-menu-item index="/knowledge">
          <el-icon><el-icon-folder /></el-icon>
          <span>知识库管理</span>
        </el-menu-item>
        <el-menu-item index="/chat/history">
          <el-icon><el-icon-chat-dot-round /></el-icon>
          <span>对话历史</span>
        </el-menu-item>
        <el-menu-item index="/dashboard">
          <el-icon><el-icon-data-analysis /></el-icon>
          <span>数据分析</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="toggle-sidebar" @click="toggleSidebar">
            <el-icon-menu />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index" :to="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="avatar-container">
              <el-avatar :size="30" :src="userInfo?.avatar" />
              <span class="username">{{ userInfo?.username || '用户' }}</span>
              <el-icon><el-icon-arrow-down /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../store/user'
import { 
  House as ElIconHouse,
  User as ElIconUser,
  Folder as ElIconFolder,
  ChatDotRound as ElIconChatDotRound,
  DataAnalysis as ElIconDataAnalysis,
  Menu as ElIconMenu,
  ArrowDown as ElIconArrowDown
} from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const userInfo = computed(() => userStore.userInfo)
const isCollapse = ref(false)

const activeMenu = computed(() => {
  return route.path
})

const breadcrumbItems = computed(() => {
  const items = [{ path: '/', title: '首页' }]
  
  if (route.matched && route.matched.length > 0) {
    route.matched.forEach(item => {
      if (item.meta && item.meta.title && item.path !== '/') {
        items.push({
          path: item.path,
          title: item.meta.title
        })
      }
    })
  }
  
  return items
})

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logoutAction()
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/profile')
  }
}

onMounted(async () => {
  // 如果没有用户信息，则获取用户信息
  if (!userStore.userInfo) {
    try {
      await userStore.getUserInfoAction()
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
  }
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #001529;
  transition: width 0.3s;
  overflow-x: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background-color: #002140;
  padding: 0 10px;
}

.logo-img {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}

.logo-text {
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  margin: 0;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-sidebar {
  font-size: 20px;
  margin-right: 20px;
  cursor: pointer;
}

.header-right {
  display: flex;
  align-items: center;
}

.avatar-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 5px;
  font-size: 14px;
}

.main {
  background-color: #f5f7fa;
  padding: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 