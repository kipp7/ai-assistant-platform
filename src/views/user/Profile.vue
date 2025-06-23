<template>
  <div class="profile-container">
    <div class="page-header">
      <h2>个人中心</h2>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <template v-else>
      <el-row :gutter="20">
        <el-col :xs="24" :md="8">
          <el-card shadow="hover" class="profile-card">
            <div class="profile-header">
              <div class="avatar-container">
                <el-avatar :size="100" :src="userInfo.avatar" />
                <div class="avatar-edit">
                  <el-upload
                    class="avatar-uploader"
                    action="#"
                    :http-request="uploadAvatar"
                    :show-file-list="false"
                    :before-upload="beforeAvatarUpload"
                  >
                    <el-icon class="avatar-edit-icon"><el-icon-camera /></el-icon>
                  </el-upload>
                </div>
              </div>
              <h3>{{ userInfo.username }}</h3>
              <p class="user-email">{{ userInfo.email }}</p>
            </div>
            
            <div class="profile-stats">
              <div class="stat-item">
                <div class="stat-value">{{ userStats.assistantCount }}</div>
                <div class="stat-label">我的助手</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ userStats.chatCount }}</div>
                <div class="stat-label">对话数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ userStats.knowledgeCount }}</div>
                <div class="stat-label">知识库</div>
              </div>
            </div>
            
            <div class="profile-meta">
              <div class="meta-item">
                <el-icon><el-icon-time /></el-icon>
                <span>注册时间：{{ formatDate(userInfo.created_at) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><el-icon-position /></el-icon>
                <span>最近登录：{{ formatDate(userInfo.last_login) }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :md="16">
          <el-card shadow="hover" class="settings-card">
            <template #header>
              <div class="card-header">
                <h3>账号设置</h3>
              </div>
            </template>
            
            <el-tabs v-model="activeTab">
              <el-tab-pane label="基本信息" name="basic">
                <el-form
                  ref="basicFormRef"
                  :model="basicForm"
                  :rules="basicRules"
                  label-position="top"
                >
                  <el-form-item label="用户名" prop="username">
                    <el-input v-model="basicForm.username" placeholder="请输入用户名" />
                  </el-form-item>
                  
                  <el-form-item label="电子邮箱" prop="email">
                    <el-input v-model="basicForm.email" placeholder="请输入电子邮箱" disabled />
                  </el-form-item>
                  
                  <el-form-item label="个人简介" prop="bio">
                    <el-input
                      v-model="basicForm.bio"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入个人简介"
                    />
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" :loading="saving" @click="saveBasicInfo">保存</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              
              <el-tab-pane label="修改密码" name="password">
                <el-form
                  ref="passwordFormRef"
                  :model="passwordForm"
                  :rules="passwordRules"
                  label-position="top"
                >
                  <el-form-item label="当前密码" prop="currentPassword">
                    <el-input
                      v-model="passwordForm.currentPassword"
                      type="password"
                      placeholder="请输入当前密码"
                      show-password
                    />
                  </el-form-item>
                  
                  <el-form-item label="新密码" prop="newPassword">
                    <el-input
                      v-model="passwordForm.newPassword"
                      type="password"
                      placeholder="请输入新密码"
                      show-password
                    />
                  </el-form-item>
                  
                  <el-form-item label="确认新密码" prop="confirmPassword">
                    <el-input
                      v-model="passwordForm.confirmPassword"
                      type="password"
                      placeholder="请再次输入新密码"
                      show-password
                    />
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" :loading="saving" @click="changePassword">修改密码</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              
              <el-tab-pane label="通知设置" name="notifications">
                <div class="notification-settings">
                  <div class="setting-item">
                    <div class="setting-info">
                      <h4>电子邮件通知</h4>
                      <p>接收重要更新和系统通知</p>
                    </div>
                    <el-switch v-model="notificationSettings.email" />
                  </div>
                  
                  <div class="setting-item">
                    <div class="setting-info">
                      <h4>助手回复通知</h4>
                      <p>当AI助手回复您的消息时接收通知</p>
                    </div>
                    <el-switch v-model="notificationSettings.assistant_reply" />
                  </div>
                  
                  <div class="setting-item">
                    <div class="setting-info">
                      <h4>系统更新通知</h4>
                      <p>接收关于新功能和系统更新的通知</p>
                    </div>
                    <el-switch v-model="notificationSettings.system_updates" />
                  </div>
                  
                  <div class="setting-actions">
                    <el-button type="primary" :loading="saving" @click="saveNotificationSettings">保存设置</el-button>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../store/user'
import { Camera as ElIconCamera, Time as ElIconTime, Position as ElIconPosition } from '@element-plus/icons-vue'

const userStore = useUserStore()

const loading = ref(true)
const saving = ref(false)
const activeTab = ref('basic')

const userInfo = ref({})
const userStats = ref({
  assistantCount: 0,
  chatCount: 0,
  knowledgeCount: 0
})

const basicFormRef = ref(null)
const passwordFormRef = ref(null)

const basicForm = reactive({
  username: '',
  email: '',
  bio: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const notificationSettings = reactive({
  email: true,
  assistant_reply: true,
  system_updates: false
})

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (passwordForm.confirmPassword !== '') {
      passwordFormRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const basicRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '个人简介不能超过200个字符', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validatePass2, trigger: 'blur' }
  ]
}

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const beforeAvatarUpload = (file) => {
  const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPGOrPNG) {
    ElMessage.error('头像只能是JPG或PNG格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过2MB!')
  }
  return isJPGOrPNG && isLt2M
}

const uploadAvatar = async (options) => {
  try {
    const formData = new FormData()
    formData.append('file', options.file)
    await userStore.uploadAvatar(formData)
    userInfo.value.avatar = userStore.userInfo.avatar
    ElMessage.success('头像上传成功')
  } catch (error) {
    ElMessage.error('头像上传失败')
  }
}

const saveBasicInfo = () => {
  basicFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        await userStore.updateUserInfo({
          username: basicForm.username,
          bio: basicForm.bio
        })
        ElMessage.success('基本信息保存成功')
        userInfo.value = { ...userInfo.value, ...basicForm }
      } catch (error) {
        ElMessage.error(error.message || '保存失败')
      } finally {
        saving.value = false
      }
    }
  })
}

const changePassword = () => {
  passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        await userStore.changePassword({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword
        })
        ElMessage.success('密码修改成功')
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
      } catch (error) {
        ElMessage.error(error.message || '密码修改失败')
      } finally {
        saving.value = false
      }
    }
  })
}

const saveNotificationSettings = async () => {
  saving.value = true
  try {
    await userStore.updateNotificationSettings(notificationSettings)
    ElMessage.success('通知设置保存成功')
  } catch (error) {
    ElMessage.error('通知设置保存失败')
  } finally {
    saving.value = false
  }
}

const fetchUserInfo = async () => {
  try {
    const data = await userStore.fetchUserProfile()
    userInfo.value = data
    
    // 初始化表单数据
    basicForm.username = data.username
    basicForm.email = data.email
    basicForm.bio = data.bio || ''
    
    // 初始化通知设置
    if (data.notification_settings) {
      notificationSettings.email = data.notification_settings.email
      notificationSettings.assistant_reply = data.notification_settings.assistant_reply
      notificationSettings.system_updates = data.notification_settings.system_updates
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
}

const fetchUserStats = async () => {
  try {
    const data = await userStore.fetchUserStats()
    userStats.value = data
  } catch (error) {
    console.error('获取用户统计数据失败', error)
  }
}

onMounted(async () => {
  loading.value = true
  await fetchUserInfo()
  await fetchUserStats()
  loading.value = false
})
</script>

<style scoped>
.profile-container {
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

.loading-container {
  padding: 40px 0;
}

.profile-card,
.settings-card {
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.avatar-container {
  position: relative;
  margin-bottom: 15px;
}

.avatar-edit {
  position: absolute;
  right: 0;
  bottom: 0;
}

.avatar-edit-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #409EFF;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.avatar-edit-icon:hover {
  background-color: #66b1ff;
}

.profile-header h3 {
  margin: 10px 0 5px;
  font-size: 18px;
  color: #303133;
}

.user-email {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.profile-meta {
  padding: 20px 0 0;
}

.meta-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.meta-item .el-icon {
  margin-right: 8px;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.notification-settings {
  padding: 10px 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h4 {
  margin: 0 0 5px;
  font-size: 16px;
  color: #303133;
}

.setting-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.setting-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .profile-stats {
    padding: 15px 0;
  }
  
  .stat-value {
    font-size: 20px;
  }
}
</style> 