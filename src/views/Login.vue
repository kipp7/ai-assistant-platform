<template>
  <div class="login-container">
    <div class="login-background">
      <div class="shape shape1"></div>
      <div class="shape shape2"></div>
      <div class="shape shape3"></div>
    </div>
    
    <div class="login-card">
      <div class="login-content">
        <div class="login-header">
          <div class="logo">
            <el-icon class="logo-icon"><el-icon-monitor /></el-icon>
          </div>
          <h1>AI助手平台</h1>
          <p>登录您的账户以继续</p>
        </div>
        
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              :prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>
          
          <div class="login-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-button type="text" class="forgot-password">忘记密码?</el-button>
          </div>
          
          <el-button
            type="primary"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
            size="large"
          >
            登录
          </el-button>
          
          <div class="register-link">
            还没有账户? <el-button type="text" @click="toRegister">立即注册</el-button>
          </div>
        </el-form>
        
        <div class="demo-info">
          <el-divider>演示信息</el-divider>
          <div class="info-item">
            <el-icon><el-icon-user /></el-icon>
            <span>用户名: admin</span>
          </div>
          <div class="info-item">
            <el-icon><el-icon-lock /></el-icon>
            <span>密码: 123456</span>
          </div>
        </div>
      </div>
      
      <div class="login-illustration">
        <img src="../assets/login-illustration.svg" alt="登录插图" class="illustration-image" />
        <div class="illustration-text">
          <h2>智能AI助手管理平台</h2>
          <p>创建、管理和优化您的AI助手，提升工作效率</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'
import { User, Lock, Monitor as ElIconMonitor } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: '123456'
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await userStore.loginAction(loginForm)
        console.log('登录成功，响应数据:', res)
        ElMessage.success('登录成功')
        // 确保路由跳转在token设置之后
        setTimeout(() => {
          router.push('/')
        }, 300)
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error(error.message || '登录失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}

const toRegister = () => {
  router.push('/register')
}

// 检查是否已经登录
onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    router.push('/')
  }
})
</script>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, #1890ff, #36cfc9);
  animation: float 15s infinite ease-in-out;
}

.shape1 {
  width: 400px;
  height: 400px;
  top: -200px;
  right: -100px;
  opacity: 0.4;
}

.shape2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -100px;
  opacity: 0.3;
  animation-delay: 5s;
}

.shape3 {
  width: 250px;
  height: 250px;
  bottom: 40%;
  right: 15%;
  opacity: 0.2;
  animation-delay: 10s;
}

@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(20px, 20px) rotate(10deg);
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
}

.login-card {
  display: flex;
  width: min(90%, 1200px);
  height: min(90vh, 700px);
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1;
  animation: fadeIn 0.8s ease-in-out;
  margin: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-content {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
}

.logo-icon {
  font-size: 30px;
  color: #fff;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px;
}

.login-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.forgot-password {
  padding: 0;
  font-size: 14px;
}

.login-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  border: none;
  transition: all 0.3s;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(24, 144, 255, 0.3);
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #606266;
  margin-bottom: 30px;
}

.demo-info {
  margin-top: auto;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.login-illustration {
  flex: 1;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.illustration-image {
  width: 80%;
  max-width: 300px;
  margin-bottom: 30px;
  animation: float 6s infinite ease-in-out;
}

.illustration-text {
  text-align: center;
  z-index: 1;
}

.illustration-text h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
}

.illustration-text p {
  font-size: 14px;
  opacity: 0.9;
  max-width: 300px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .login-card {
    width: 95%;
    height: min(95vh, 800px);
    flex-direction: column-reverse;
  }
  
  .login-illustration {
    padding: 30px;
    max-height: 30%;
  }
  
  .login-content {
    flex: 1;
    overflow-y: auto;
  }
  
  .illustration-image {
    width: 40%;
    max-width: 180px;
    margin-bottom: 15px;
  }
  
  .illustration-text h2 {
    font-size: 20px;
  }
  
  .illustration-text p {
    font-size: 13px;
  }
}

@media (max-width: 576px) {
  .login-card {
    width: 100%;
    height: 100%;
    max-height: 100vh;
    border-radius: 0;
    margin: 0;
  }
  
  .login-content {
    padding: 20px 15px;
  }
  
  .login-illustration {
    padding: 15px;
    max-height: 25%;
  }
  
  .logo {
    width: 50px;
    height: 50px;
  }
  
  .login-header h1 {
    font-size: 22px;
  }
  
  .login-button {
    height: 45px;
  }
  
  .shape1 {
    width: 200px;
    height: 200px;
  }
  
  .shape2 {
    width: 150px;
    height: 150px;
  }
}

/* 全屏适配 */
@media (min-height: 900px) {
  .login-card {
    height: min(80vh, 750px);
  }
}

@media (min-width: 1600px) {
  .login-card {
    width: min(80%, 1400px);
  }
  
  .login-content,
  .login-illustration {
    padding: 60px;
  }
  
  .login-header h1 {
    font-size: 28px;
  }
  
  .illustration-text h2 {
    font-size: 28px;
  }
  
  .illustration-text p {
    font-size: 16px;
  }
}

/* 确保全屏覆盖 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

#app {
  height: 100%;
  width: 100%;
}
</style> 