<template>
  <div class="knowledge-list-container">
    <div class="page-header">
      <h2>知识库管理</h2>
      <el-button type="primary" @click="uploadKnowledge">上传文档</el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else-if="knowledgeBases.length === 0" class="empty-container">
      <el-empty description="暂无知识库文档，快去上传一个吧！">
        <el-button type="primary" @click="uploadKnowledge">上传文档</el-button>
      </el-empty>
    </div>
    
    <div v-else>
      <el-table
        :data="knowledgeBases"
        style="width: 100%"
        border
      >
        <el-table-column prop="filename" label="文件名" min-width="180">
          <template #default="{ row }">
            <div class="file-info">
              <el-icon class="file-icon"><el-icon-document /></el-icon>
              <span>{{ row.filename }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="file_type" label="文件类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.file_type }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="file_size" label="文件大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.file_size) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="upload_time" label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.upload_time) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="used_by" label="关联助手" width="120">
          <template #default="{ row }">
            <el-popover
              placement="top"
              :width="200"
              trigger="hover"
              v-if="row.used_by && row.used_by.length > 0"
            >
              <template #default>
                <div v-for="assistant in row.used_by" :key="assistant.id" class="assistant-item">
                  <span>{{ assistant.name }}</span>
                </div>
              </template>
              <template #reference>
                <el-tag type="success">{{ row.used_by.length }}个助手</el-tag>
              </template>
            </el-popover>
            <span v-else>未关联</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="previewFile(row)">预览</el-button>
            <el-popconfirm
              title="确定要删除该文档吗？"
              @confirm="deleteKnowledge(row.id)"
            >
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <el-dialog
      v-model="previewDialogVisible"
      title="文档预览"
      width="70%"
      destroy-on-close
    >
      <div v-if="previewLoading" class="preview-loading">
        <el-skeleton :rows="10" animated />
      </div>
      <div v-else class="preview-content">
        <div v-if="currentFile.file_type === 'pdf'" class="pdf-preview">
          <iframe :src="currentFile.preview_url" width="100%" height="500"></iframe>
        </div>
        <div v-else-if="['txt', 'md', 'json'].includes(currentFile.file_type)" class="text-preview">
          <pre>{{ currentFile.content }}</pre>
        </div>
        <div v-else class="unsupported-preview">
          <el-alert
            title="不支持预览此类型文件"
            type="info"
            :closable="false"
            show-icon
          />
          <div class="download-tip">
            <p>您可以下载此文件后查看</p>
            <el-button type="primary" @click="downloadFile(currentFile)">下载文件</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useKnowledgeStore } from '../../store/knowledge'
import { Document as ElIconDocument } from '@element-plus/icons-vue'

const router = useRouter()
const knowledgeStore = useKnowledgeStore()

const loading = ref(true)
const previewDialogVisible = ref(false)
const previewLoading = ref(false)
const currentFile = ref({})

const knowledgeBases = computed(() => knowledgeStore.knowledgeBases)

const uploadKnowledge = () => {
  router.push('/knowledge/upload')
}

const formatFileSize = (size) => {
  if (!size) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  
  return `${size.toFixed(2)} ${units[i]}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const previewFile = async (file) => {
  currentFile.value = { ...file }
  previewDialogVisible.value = true
  
  if (['txt', 'md', 'json', 'pdf'].includes(file.file_type)) {
    previewLoading.value = true
    try {
      const result = await knowledgeStore.getFilePreview(file.id)
      currentFile.value = { ...currentFile.value, ...result }
    } catch (error) {
      ElMessage.error('获取文件预览失败')
    } finally {
      previewLoading.value = false
    }
  }
}

const downloadFile = (file) => {
  if (file.download_url) {
    window.open(file.download_url, '_blank')
  } else {
    ElMessage.error('下载链接不可用')
  }
}

const deleteKnowledge = async (id) => {
  try {
    await knowledgeStore.deleteKnowledgeBase(id)
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error(error.message || '删除失败')
  }
}

onMounted(async () => {
  try {
    await knowledgeStore.fetchKnowledgeBases()
  } catch (error) {
    ElMessage.error('获取知识库列表失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.knowledge-list-container {
  padding: 20px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.loading-container,
.empty-container {
  padding: 40px 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #909399;
}

.assistant-item {
  padding: 5px 0;
  border-bottom: 1px solid #ebeef5;
}

.assistant-item:last-child {
  border-bottom: none;
}

.preview-loading {
  padding: 20px 0;
}

.preview-content {
  max-height: 500px;
  overflow-y: auto;
}

.text-preview pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  font-family: monospace;
  margin: 0;
}

.unsupported-preview {
  text-align: center;
  padding: 30px 0;
}

.download-tip {
  margin-top: 20px;
}
</style> 