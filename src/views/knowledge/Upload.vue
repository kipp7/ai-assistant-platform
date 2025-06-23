<template>
  <div class="knowledge-upload-container">
    <div class="page-header">
      <div class="header-left">
        <el-button icon="el-icon-back" @click="goBack" text>返回</el-button>
        <h2>上传知识库文档</h2>
      </div>
    </div>
    
    <el-card class="upload-card">
      <div class="upload-area">
        <el-upload
          class="upload-component"
          drag
          action="#"
          :http-request="handleUpload"
          :before-upload="beforeUpload"
          :on-exceed="handleExceed"
          :limit="5"
          :multiple="true"
          :file-list="fileList"
          :auto-upload="false"
        >
          <el-icon class="el-icon--upload"><el-icon-upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处，或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持上传PDF、TXT、DOCX、MD等文本文件，单个文件不超过10MB
            </div>
          </template>
        </el-upload>
        
        <div class="upload-actions">
          <el-button type="primary" @click="submitUpload" :loading="uploading">
            {{ uploading ? '上传中...' : '开始上传' }}
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </div>
      </div>
      
      <div class="upload-tips">
        <h3>上传说明</h3>
        <ul>
          <li>支持的文件格式：PDF、TXT、DOCX、MD、JSON</li>
          <li>单个文件大小限制：10MB</li>
          <li>最多同时上传5个文件</li>
          <li>上传的文件将作为AI助手的知识库，可以关联到一个或多个助手</li>
          <li>文件上传后会自动进行处理，可能需要一些时间才能生效</li>
        </ul>
      </div>
    </el-card>
    
    <el-dialog
      v-model="progressDialogVisible"
      title="上传进度"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="progress-list">
        <div v-for="(file, index) in uploadingFiles" :key="index" class="progress-item">
          <div class="progress-info">
            <div class="filename">{{ file.name }}</div>
            <div class="progress-status">{{ file.status }}</div>
          </div>
          <el-progress :percentage="file.percentage" :status="file.status === '上传失败' ? 'exception' : file.percentage === 100 ? 'success' : ''" />
        </div>
      </div>
      
      <div class="dialog-footer">
        <el-button @click="closeProgressDialog" :disabled="uploading">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useKnowledgeStore } from '../../store/knowledge'
import { UploadFilled as ElIconUploadFilled } from '@element-plus/icons-vue'

const router = useRouter()
const knowledgeStore = useKnowledgeStore()

const fileList = ref([])
const uploading = ref(false)
const progressDialogVisible = ref(false)
const uploadingFiles = ref([])

const goBack = () => {
  if (uploading.value) {
    ElMessageBox.confirm('上传正在进行中，确定要取消吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.push('/knowledge')
    }).catch(() => {})
  } else {
    router.push('/knowledge')
  }
}

const beforeUpload = (file) => {
  // 检查文件类型
  const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/markdown', 'application/json']
  const isAllowedType = allowedTypes.includes(file.type)
  
  // 检查文件扩展名
  const fileName = file.name.toLowerCase()
  const isAllowedExtension = /\.(pdf|txt|docx|md|json)$/.test(fileName)
  
  // 检查文件大小，限制为10MB
  const isLt10M = file.size / 1024 / 1024 < 10
  
  if (!isAllowedType && !isAllowedExtension) {
    ElMessage.error('不支持的文件类型！')
    return false
  }
  
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB！')
    return false
  }
  
  return true
}

const handleExceed = () => {
  ElMessage.warning('最多只能上传5个文件！')
}

const handleUpload = ({ file, onProgress, onSuccess, onError }) => {
  // 这个函数在submitUpload中统一处理
  return { file, onProgress, onSuccess, onError }
}

const submitUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要上传的文件！')
    return
  }
  
  uploading.value = true
  progressDialogVisible.value = true
  uploadingFiles.value = fileList.value.map(file => ({
    name: file.name,
    percentage: 0,
    status: '等待上传'
  }))
  
  const uploadPromises = fileList.value.map((file, index) => {
    return new Promise((resolve) => {
      uploadingFiles.value[index].status = '上传中...'
      
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        if (uploadingFiles.value[index].percentage < 90) {
          uploadingFiles.value[index].percentage += 10
        }
      }, 300)
      
      // 调用实际的上传API
      const formData = new FormData()
      formData.append('file', file.raw)
      
      knowledgeStore.uploadKnowledgeBase(formData)
        .then(() => {
          clearInterval(progressInterval)
          uploadingFiles.value[index].percentage = 100
          uploadingFiles.value[index].status = '上传成功'
          resolve({ success: true })
        })
        .catch((error) => {
          clearInterval(progressInterval)
          uploadingFiles.value[index].status = '上传失败'
          ElMessage.error(`文件 ${file.name} 上传失败: ${error.message || '未知错误'}`)
          resolve({ success: false, error })
        })
    })
  })
  
  try {
    await Promise.all(uploadPromises)
    ElMessage.success('文件上传完成')
  } catch (error) {
    console.error('上传过程中发生错误', error)
  } finally {
    uploading.value = false
  }
}

const closeProgressDialog = () => {
  if (!uploading.value) {
    progressDialogVisible.value = false
    router.push('/knowledge')
  }
}
</script>

<style scoped>
.knowledge-upload-container {
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

.upload-card {
  margin-bottom: 20px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.upload-component {
  width: 100%;
  max-width: 600px;
}

.upload-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.upload-tips {
  margin-top: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.upload-tips h3 {
  font-size: 16px;
  color: #303133;
  margin-top: 0;
  margin-bottom: 15px;
}

.upload-tips ul {
  margin: 0;
  padding-left: 20px;
}

.upload-tips li {
  margin-bottom: 8px;
  color: #606266;
}

.progress-list {
  margin-bottom: 20px;
}

.progress-item {
  margin-bottom: 15px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.filename {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.progress-status {
  font-size: 14px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .upload-component {
    max-width: 100%;
  }
  
  .filename {
    max-width: 200px;
  }
}
</style> 