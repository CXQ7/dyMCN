<template>
  <div class="knowledge-base">
    <!-- 顶部标签页 -->
    <el-tabs v-model="activeTab" class="main-tabs">
      <el-tab-pane label="文档库" name="documents">
        <el-card shadow="never" class="document-section">
          <!-- 操作栏 -->
          <div class="action-bar">
            <div class="left-actions">
              <el-select v-model="selectedScene" placeholder="选择场景" style="width: 200px">
                <el-option label="美妆直播间" value="makeup" />
                <el-option label="服装直播间" value="clothing" />
                <el-option label="家居直播间" value="home" />
              </el-select>
            </div>
            <div class="right-actions">
              <el-button type="primary" @click="uploadDocument">
                <el-icon><Upload /></el-icon>
                上传文档
              </el-button>
            </div>
          </div>

          <!-- 文档列表 -->
          <el-table :data="documentList" style="width: 100%">
            <el-table-column prop="name" label="文档名称" min-width="200">
              <template #default="{ row }">
                <el-icon style="margin-right: 8px;">
                  <Document v-if="row.type === 'pdf'" />
                  <Tickets v-else-if="row.type === 'excel'" />
                  <Edit v-else />
                </el-icon>
                {{ row.name }}
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getTypeColor(row.type)" size="small">
                  {{ getTypeLabel(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusColor(row.status)" size="small">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" width="100" />
            <el-table-column prop="createTime" label="上传时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="viewDocument(row)">查看</el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="extractKnowledge(row)"
                  :disabled="row.status === 'processing'"
                >
                  提取知识
                </el-button>
                <el-button size="small" type="danger" @click="deleteDocument(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="Q&A库" name="qa">
        <el-card shadow="never" class="qa-section">
          <!-- 操作栏 -->
          <div class="action-bar">
            <div class="left-actions">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索问题或答案"
                style="width: 300px;"
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
            <div class="right-actions">
              <el-button type="primary" @click="createQA">
                <el-icon><Plus /></el-icon>
                新建Q&A
              </el-button>
            </div>
          </div>

          <!-- Q&A列表 -->
          <div class="qa-list">
            <div v-for="qa in filteredQAList" :key="qa.id" class="qa-item">
              <div class="qa-content">
                <div class="question">
                  <el-icon><QuestionFilled /></el-icon>
                  <span>{{ qa.question }}</span>
                </div>
                <div class="answer">
                  <el-icon><ChatDotSquare /></el-icon>
                  <span>{{ qa.answer }}</span>
                </div>
                <div class="qa-meta">
                  <div class="meta-left">
                    <el-tag size="small" type="info">{{ qa.source }}</el-tag>
                    <span class="meta-item">创建时间：{{ formatDate(qa.createTime) }}</span>
                  </div>
                  <div class="meta-right">
                    <span class="meta-item">
                      <el-icon><Check /></el-icon>
                      {{ qa.likes }}
                    </span>
                    <span class="meta-item">
                      <el-icon><Close /></el-icon>
                      {{ qa.dislikes }}
                    </span>
                    <span class="meta-item">使用{{ qa.usageCount }}次</span>
                  </div>
                </div>
              </div>
              <div class="qa-actions">
                <el-button size="small" @click="editQA(qa)">编辑</el-button>
                <el-button size="small" type="success" @click="likeQA(qa)">
                  <el-icon><Check /></el-icon>
                </el-button>
                <el-button size="small" type="warning" @click="dislikeQA(qa)">
                  <el-icon><Close /></el-icon>
                </el-button>
                <el-button size="small" type="danger" @click="deleteQA(qa)">删除</el-button>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="totalQA"
              layout="total, prev, pager, next"
              @current-change="handlePageChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- Q&A编辑对话框 -->
    <el-dialog v-model="qaDialogVisible" title="编辑Q&A" width="600px">
      <el-form :model="qaForm" label-width="80px">
        <el-form-item label="问题">
          <el-input v-model="qaForm.question" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="答案">
          <el-input v-model="qaForm.answer" type="textarea" :rows="5" />
        </el-form-item>
        <el-form-item label="来源">
          <el-input v-model="qaForm.source" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="qaDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveQA">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface DocumentItem {
  id: number
  name: string
  type: 'pdf' | 'excel' | 'word' | 'text'
  status: 'processed' | 'pending' | 'processing'
  size: string
  createTime: Date
  scene: string
}

interface QAItem {
  id: number
  question: string
  answer: string
  source: string
  likes: number
  dislikes: number
  usageCount: number
  createTime: Date
}

const activeTab = ref('documents')
const selectedScene = ref('makeup')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const qaDialogVisible = ref(false)

const qaForm = ref({
  question: '',
  answer: '',
  source: ''
})

const documentList = ref<DocumentItem[]>([
  {
    id: 1,
    name: '美妆产品使用指南.pdf',
    type: 'pdf',
    status: 'processed',
    size: '2.5MB',
    createTime: new Date('2024-01-15'),
    scene: 'makeup'
  },
  {
    id: 2,
    name: '客服话术模板.docx',
    type: 'word',
    status: 'processed',
    size: '1.2MB',
    createTime: new Date('2024-01-14'),
    scene: 'makeup'
  },
  {
    id: 3,
    name: '产品价格表.xlsx',
    type: 'excel',
    status: 'pending',
    size: '800KB',
    createTime: new Date('2024-01-13'),
    scene: 'makeup'
  },
  {
    id: 4,
    name: '直播间ASR记录_20240112.txt',
    type: 'text',
    status: 'processing',
    size: '5.2MB',
    createTime: new Date('2024-01-12'),
    scene: 'makeup'
  }
])

const qaList = ref<QAItem[]>([
  {
    id: 1,
    question: '这款口红适合什么肤色？',
    answer: '这款口红有多种色号，暖色调适合暖肤色，冷色调适合冷肤色。建议您根据个人肤色特点选择最适合的色号。',
    source: '产品说明书',
    likes: 15,
    dislikes: 2,
    usageCount: 45,
    createTime: new Date('2024-01-10')
  },
  {
    id: 2,
    question: '化妆品的保质期是多久？',
    answer: '一般化妆品未开封保质期为3年，开封后建议在12-24个月内使用完毕，具体请查看产品包装上的标识。',
    source: '客服手册',
    likes: 23,
    dislikes: 1,
    usageCount: 78,
    createTime: new Date('2024-01-09')
  },
  {
    id: 3,
    question: '如何判断护肤品是否适合自己？',
    answer: '建议先在耳后或手腕处小面积试用，观察24-48小时是否有过敏反应。同时根据自己的肌肤类型选择相应的产品。',
    source: '美妆指南',
    likes: 18,
    dislikes: 3,
    usageCount: 32,
    createTime: new Date('2024-01-08')
  }
])

const filteredQAList = computed(() => {
  if (!searchKeyword.value) return qaList.value
  return qaList.value.filter(qa => 
    qa.question.includes(searchKeyword.value) || 
    qa.answer.includes(searchKeyword.value)
  )
})

const totalQA = computed(() => filteredQAList.value.length)

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    pdf: 'danger',
    excel: 'success',
    word: 'primary',
    text: 'info'
  }
  return colors[type] || 'info'
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    pdf: 'PDF',
    excel: 'Excel',
    word: 'Word',
    text: 'Text'
  }
  return labels[type] || type
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    processed: 'success',
    pending: 'warning',
    processing: 'info'
  }
  return colors[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    processed: '已挖掘',
    pending: '待挖掘',
    processing: '正在处理'
  }
  return labels[status] || status
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

const uploadDocument = () => {
  ElMessage.info('文档上传功能开发中...')
}

const viewDocument = (doc: DocumentItem) => {
  ElMessage.info(`查看文档: ${doc.name}`)
}

const extractKnowledge = (doc: DocumentItem) => {
  ElMessage.success(`开始提取知识: ${doc.name}`)
  // 模拟处理状态变化
  doc.status = 'processing'
  setTimeout(() => {
    doc.status = 'processed'
    ElMessage.success('知识提取完成')
  }, 3000)
}

const deleteDocument = async (doc: DocumentItem) => {
  try {
    await ElMessageBox.confirm('确定要删除这个文档吗？', '确认删除', {
      type: 'warning'
    })
    
    const index = documentList.value.findIndex(d => d.id === doc.id)
    if (index > -1) {
      documentList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    ElMessage.info('已取消删除')
  }
}

const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword
  currentPage.value = 1
}

const createQA = () => {
  qaForm.value = {
    question: '',
    answer: '',
    source: ''
  }
  qaDialogVisible.value = true
}

const editQA = (qa: QAItem) => {
  qaForm.value = {
    question: qa.question,
    answer: qa.answer,
    source: qa.source
  }
  qaDialogVisible.value = true
}

const saveQA = () => {
  if (!qaForm.value.question.trim() || !qaForm.value.answer.trim()) {
    ElMessage.warning('请填写完整的问题和答案')
    return
  }
  
  // 这里应该调用API保存数据
  ElMessage.success('保存成功')
  qaDialogVisible.value = false
}

const likeQA = (qa: QAItem) => {
  qa.likes++
  ElMessage.success('点赞成功')
}

const dislikeQA = (qa: QAItem) => {
  qa.dislikes++
  ElMessage.warning('已标记不满意')
}

const deleteQA = async (qa: QAItem) => {
  try {
    await ElMessageBox.confirm('确定要删除这个Q&A吗？', '确认删除', {
      type: 'warning'
    })
    
    const index = qaList.value.findIndex(q => q.id === qa.id)
    if (index > -1) {
      qaList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    ElMessage.info('已取消删除')
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}
</script>

<style scoped>
.knowledge-base {
  padding: 0;
}

.main-tabs {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.document-section, .qa-section {
  border: none;
  box-shadow: none;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.left-actions, .right-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.qa-list {
  margin-bottom: 24px;
}

.qa-item {
  display: flex;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.2s;
}

.qa-item:hover {
  border-color: #d9d9d9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qa-content {
  flex: 1;
  margin-right: 16px;
}

.question, .answer {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  line-height: 1.6;
}

.question .el-icon, .answer .el-icon {
  margin-right: 8px;
  margin-top: 2px;
  flex-shrink: 0;
}

.question {
  font-weight: 500;
  color: #262626;
}

.answer {
  color: #52c41a;
}

.qa-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #8c8c8c;
}

.meta-left, .meta-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qa-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table th) {
  background-color: #fafafa;
  font-weight: 600;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
}

:deep(.el-tabs__active-bar) {
  background-color: #1890ff;
}

:deep(.el-tabs__item.is-active) {
  color: #1890ff;
}
</style>