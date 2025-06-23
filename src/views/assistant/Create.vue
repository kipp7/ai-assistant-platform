<template>
  <div class="assistant-create-container">
    <div class="page-header">
      <h2>创建AI助手</h2>
    </div>
    
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
          placeholder="请输入助手描述，如：这是一个专注于前端技术的AI助手，擅长解答Vue、React等框架问题..."
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
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" :loading="loading" @click="submitForm">创建</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAssistantStore } from '../../store/assistant'
import { useKnowledgeStore } from '../../store/knowledge'
import { uploadAssistantAvatar } from '../../api/assistant'
import { Plus as ElIconPlus } from '@element-plus/icons-vue'

const router = useRouter()
const assistantStore = useAssistantStore()
const knowledgeStore = useKnowledgeStore()

const formRef = ref(null)
const loading = ref(false)
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
      loading.value = true
      try {
        await assistantStore.createAssistant(form)
        ElMessage.success('创建成功')
        router.push('/assistants')
      } catch (error) {
        ElMessage.error(error.message || '创建失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const cancel = () => {
  router.push('/assistants')
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
  fetchKnowledgeBases()
})
</script>

<style scoped>
.assistant-create-container {
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

.assistant-form {
  max-width: 800px;
}

.full-width {
  width: 100%;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .assistant-form {
    max-width: 100%;
  }
}
</style> 