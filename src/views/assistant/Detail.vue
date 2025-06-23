<template>
  <div class="assistant-detail-container">
    <div class="page-header">
      <div class="header-left">
        <el-button icon="el-icon-back" @click="goBack" text>返回</el-button>
        <h2>{{ isEdit ? '编辑AI助手' : 'AI助手详情' }}</h2>
      </div>
      <div class="header-actions" v-if="!isEdit">
        <el-button @click="startEdit">编辑</el-button>
        <el-button type="primary" @click="chatWithAssistant">对话</el-button>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <template v-else>
      <!-- 编辑模式 -->
      <template v-if="isEdit">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="assistant-form"
        >
          <el-form-item label="助手名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入助手名称" />
          </el-form-item>
          
          <el-form-item label="专业领域" prop="domain">
            <el-select v-model="form.domain" placeholder="请选择专业领域" class="full-width">
              <el-option label="前端开发" value="前端开发" />
              <el-option label="后端开发" value="后端开发" />
              <el-option label="产品经理" value="产品经理" />
              <el-option label="设计师" value="设计师" />
              <el-option label="数据分析" value="数据分析" />
              <el-option label="市场营销" value="市场营销" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="回复风格" prop="tone">
            <el-select v-model="form.tone" placeholder="请选择回复风格" class="full-width">
              <el-option label="专业" value="专业" />
              <el-option label="友好" value="友好" />
              <el-option label="幽默" value="幽默" />
              <el-option label="简洁" value="简洁" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="助手头像">
            <el-upload
              class="avatar-uploader"
              action="#"
              :http-request="uploadAvatar"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
            >
              <img v-if="form.avatar" :src="form.avatar" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><el-icon-plus /></el-icon>
            </el-upload>
            <div class="upload-tip">点击上传头像，只能上传jpg/png文件，且不超过2MB</div>
          </el-form-item>
          
          <el-form-item label="助手描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              placeholder="请输入助手描述"
            />
          </el-form-item>
          
          <el-form-item label="关联知识库">
            <el-transfer
              v-model="form.knowledge_base_ids"
              :data="knowledgeOptions"
              :titles="['可选知识库', '已选知识库']"
              :button-texts="['移除', '添加']"
              :props="{
                key: 'id',
                label: 'filename'
              }"
            />
          </el-form-item>
          
          <el-form-item>
            <div class="form-actions">
              <el-button @click="cancelEdit">取消</el-button>
              <el-button type="primary" :loading="saveLoading" @click="submitForm">保存</el-button>
            </div>
          </el-form-item>
        </el-form>
      </template>
      
      <!-- 查看模式 -->
      <template v-else>
        <el-card class="detail-card">
          <div class="assistant-profile">
            <div class="profile-header">
              <el-avatar :size="100" :src="assistant.avatar" />
              <div class="profile-info">
                <h3>{{ assistant.name }}</h3>
                <div class="profile-meta">
                  <el-tag size="small">{{ assistant.domain }}</el-tag>
                  <el-tag size="small" type="success">{{ assistant.tone }}</el-tag>
                </div>
              </div>
            </div>
            
            <div class="profile-desc">
              <h4>助手描述</h4>
              <p>{{ assistant.description }}</p>
            </div>
            
            <div class="profile-knowledge">
              <h4>关联知识库 ({{ assistant.knowledge_bases?.length || 0 }})</h4>
              <div v-if="!assistant.knowledge_bases || assistant.knowledge_bases.length === 0" class="empty-tip">
                暂无关联知识库
              </div>
              <div v-else class="knowledge-list">
                <el-tag
                  v-for="kb in assistant.knowledge_bases"
                  :key="kb.id"
                  class="knowledge-tag"
                >
                  {{ kb.filename }}
                </el-tag>
              </div>
            </div>
            
            <div class="profile-stats">
              <h4>使用统计</h4>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-value">{{ assistant.stats?.total_chats || 0 }}</div>
                  <div class="stat-label">对话总数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ assistant.stats?.total_messages || 0 }}</div>
                  <div class="stat-label">消息总数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ assistant.stats?.avg_response_time || '0s' }}</div>
                  <div class="stat-label">平均响应时间</div>
                </div>
              </div>
            </div>
            
            <div class="profile-meta-info">
              <div class="meta-item">
                <span class="label">创建时间：</span>
                <span class="value">{{ formatDate(assistant.created_at) }}</span>
              </div>
              <div class="meta-item">
                <span class="label">最后更新：</span>
                <span class="value">{{ formatDate(assistant.updated_at) }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAssistantStore } from '../../store/assistant'
import { useKnowledgeStore } from '../../store/knowledge'
import { uploadAssistantAvatar } from '../../api/assistant'
import { Plus as ElIconPlus } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const assistantStore = useAssistantStore()
const knowledgeStore = useKnowledgeStore()

const assistantId = computed(() => route.params.id)
const isEdit = computed(() => route.query.edit === 'true')

const loading = ref(true)
const saveLoading = ref(false)
const formRef = ref(null)
const assistant = ref({})
const knowledgeOptions = ref([])

const form = reactive({
  name: '',
  domain: '',
  tone: '',
  avatar: '',
  description: '',
  knowledge_base_ids: []
})

const rules = {
  name: [
    { required: true, message: '请输入助手名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  domain: [
    { required: true, message: '请选择专业领域', trigger: 'change' }
  ],
  tone: [
    { required: true, message: '请选择回复风格', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入助手描述', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

const goBack = () => {
  router.push('/assistants')
}

const startEdit = () => {
  router.push(`/assistants/${assistantId.value}?edit=true`)
}

const cancelEdit = () => {
  router.push(`/assistants/${assistantId.value}`)
}

const chatWithAssistant = () => {
  router.push(`/chat/${assistantId.value}`)
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
    const res = await uploadAssistantAvatar(formData)
    form.avatar = res.data.avatar
    ElMessage.success('上传成功')
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      saveLoading.value = true
      try {
        await assistantStore.updateAssistant(assistantId.value, form)
        ElMessage.success('保存成功')
        router.push(`/assistants/${assistantId.value}`)
      } catch (error) {
        ElMessage.error(error.message || '保存失败')
      } finally {
        saveLoading.value = false
      }
    }
  })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const fetchAssistantDetail = async () => {
  loading.value = true
  try {
    const data = await assistantStore.fetchAssistantById(assistantId.value)
    assistant.value = data
    
    // 如果是编辑模式，初始化表单
    if (isEdit.value) {
      Object.assign(form, {
        name: data.name,
        domain: data.domain,
        tone: data.tone,
        avatar: data.avatar,
        description: data.description,
        knowledge_base_ids: data.knowledge_bases?.map(kb => kb.id) || []
      })
    }
  } catch (error) {
    ElMessage.error('获取助手详情失败')
    router.push('/assistants')
  } finally {
    loading.value = false
  }
}

const fetchKnowledgeBases = async () => {
  try {
    await knowledgeStore.fetchKnowledgeBases()
    knowledgeOptions.value = knowledgeStore.knowledgeBases.map(item => ({
      id: item.id,
      filename: item.filename
    }))
  } catch (error) {
    ElMessage.error('获取知识库列表失败')
  }
}

onMounted(() => {
  fetchAssistantDetail()
  if (isEdit.value) {
    fetchKnowledgeBases()
  }
})
</script>

<style scoped>
.assistant-detail-container {
  padding: 20px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.loading-container {
  padding: 40px 0;
}

.assistant-form {
  max-width: 800px;
}

.full-width {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 10px;
}

.detail-card {
  margin-bottom: 20px;
}

.assistant-profile {
  padding: 10px;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.profile-info {
  margin-left: 20px;
}

.profile-info h3 {
  margin: 0 0 10px;
  font-size: 24px;
  color: #303133;
}

.profile-meta {
  display: flex;
  gap: 10px;
}

.profile-desc,
.profile-knowledge,
.profile-stats,
.profile-meta-info {
  margin-bottom: 30px;
}

.profile-desc h4,
.profile-knowledge h4,
.profile-stats h4 {
  font-size: 16px;
  color: #606266;
  margin: 0 0 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.profile-desc p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.empty-tip {
  color: #909399;
  font-size: 14px;
  padding: 10px 0;
}

.knowledge-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.knowledge-tag {
  margin-right: 10px;
  margin-bottom: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.profile-meta-info {
  font-size: 14px;
  color: #909399;
  margin-top: 20px;
}

.meta-item {
  margin-bottom: 5px;
}

.meta-item .label {
  font-weight: bold;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-info {
    margin-left: 0;
    margin-top: 20px;
  }
  
  .profile-meta {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(1, 1fr);
    gap: 10px;
  }
  
  .assistant-form {
    max-width: 100%;
  }
}
</style> 