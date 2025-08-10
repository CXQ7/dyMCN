<template>
  <div class="customer-service">
    <!-- 模式切换 -->
    <div class="mode-selector">
      <el-radio-group v-model="serviceMode" @change="handleModeChange">
        <el-radio-button label="manual">有人模式</el-radio-button>
        <el-radio-button label="auto">无人模式</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 有人模式 -->
    <div v-if="serviceMode === 'manual'" class="manual-mode">
      <el-row :gutter="16" style="height: calc(100vh - 200px);">
        <!-- 左侧：待应答列表 -->
        <el-col :span="6">
          <el-card class="full-height-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span>待应答列表</span>
                <el-badge :value="pendingList.length" />
              </div>
            </template>
            <div class="pending-list">
              <div
                v-for="item in pendingList"
                :key="item.id"
                :class="['pending-item', { active: selectedItem?.id === item.id }]"
                @click="selectItem(item)"
              >
                <div class="item-header">
                  <el-tag :type="item.type === 'comment' ? 'info' : 'warning'" size="small">
                    {{ item.type === 'comment' ? '评论' : '售前' }}
                  </el-tag>
                  <span class="priority" v-if="item.priority === 'high'">🔥</span>
                </div>
                <div class="room-user">{{ item.roomName }} - {{ item.username }}</div>
                <div class="question">{{ item.question }}</div>
                <div class="interactions">互动 {{ item.interactions }} 次</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 中间：对话工作台 -->
        <el-col :span="8">
          <el-card class="full-height-card chat-workspace" shadow="never">
            <template #header>
              <div class="card-header">
                <span>坐席对话工作台</span>
                <div v-if="selectedItem">
                  <el-tag size="small">{{ selectedItem.roomName }}</el-tag>
                  <span class="username">{{ selectedItem.username }}</span>
                </div>
              </div>
            </template>
            
            <div v-if="!selectedItem" class="no-selection">
              请从左侧选择需要回复的问题
            </div>
            
            <div v-else class="chat-container">
              <!-- 聊天记录 -->
              <div class="chat-messages">
                <div class="user-message">
                  <div class="message-header">
                    <span class="username">{{ selectedItem.username }}</span>
                    <span class="time">{{ formatTime(selectedItem.time) }}</span>
                  </div>
                  <div class="message-content user">{{ selectedItem.question }}</div>
                </div>
                
                <div v-for="msg in chatHistory" :key="msg.id" class="message">
                  <div class="message-header">
                    <span class="username">{{ msg.sender === 'agent' ? '客服' : selectedItem.username }}</span>
                    <span class="time">{{ formatTime(msg.time) }}</span>
                  </div>
                  <div :class="['message-content', msg.sender]">{{ msg.content }}</div>
                </div>
              </div>

              <!-- 输入区域 -->
              <div class="input-area">
                <el-input
                  v-model="inputMessage"
                  type="textarea"
                  :rows="3"
                  placeholder="输入回复内容..."
                  @keyup.enter.ctrl="sendMessage"
                />
                <div class="input-tools">
                  <div class="tool-buttons">
                    <el-button size="small" @click="insertImage">插入图片</el-button>
                    <el-button size="small" @click="insertVideo">插入视频</el-button>
                    <el-button size="small" @click="insertLink">插入链接</el-button>
                  </div>
                  <div class="send-buttons">
                    <el-button size="small" @click="startVoiceInput">语音输入</el-button>
                    <el-button type="primary" size="small" @click="sendMessage">发送</el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧区域 -->
        <el-col :span="10">
          <div style="height: 100%; display: flex; flex-direction: column; gap: 16px;">
            <!-- 客户背景摘要 -->
            <el-card style="flex: 1;" shadow="never">
              <template #header>
                <span>客户背景摘要</span>
              </template>
              <div v-if="selectedItem" class="customer-summary">
                <div class="summary-item">
                  <span class="label">用户昵称：</span>{{ selectedItem.username }}
                </div>
                <div class="summary-item">
                  <span class="label">来访次数：</span>15次
                </div>
                <div class="summary-item">
                  <span class="label">互动次数：</span>{{ selectedItem.interactions }}次
                </div>
                <div class="summary-item">
                  <span class="label">提问次数：</span>8次
                </div>
                <div class="summary-item">
                  <span class="label">历史订单：</span>3笔，总额￥2,580
                </div>
                <div class="summary-item">
                  <span class="label">常咨询问题：</span>
                  <div class="question-list">
                    <el-tag size="small" style="margin: 2px;">产品规格</el-tag>
                    <el-tag size="small" style="margin: 2px;">价格优惠</el-tag>
                    <el-tag size="small" style="margin: 2px;">物流时间</el-tag>
                  </div>
                </div>
              </div>
              <div v-else class="no-customer">
                请选择客户查看背景信息
              </div>
            </el-card>

            <!-- 信息提示助手 -->
            <el-card style="flex: 1;" shadow="never">
              <template #header>
                <span>信息提示助手</span>
              </template>
              <div v-if="selectedItem" class="ai-suggestions">
                <div v-for="suggestion in aiSuggestions" :key="suggestion.id" class="suggestion-item">
                  <div class="suggestion-content">{{ suggestion.content }}</div>
                  <div class="suggestion-actions">
                    <el-button size="small" @click="editSuggestion(suggestion)">编辑回复</el-button>
                    <el-button size="small" type="primary" @click="adoptSuggestion(suggestion)">采纳回复</el-button>
                  </div>
                </div>
              </div>
              <div v-else class="no-suggestions">
                请选择问题查看AI建议
              </div>
            </el-card>

            <!-- 知识挖掘反馈区 -->
            <el-card style="flex: 1;" shadow="never">
              <template #header>
                <span>结构化知识挖掘反馈</span>
              </template>
              <div class="knowledge-feedback">
                <div v-for="item in knowledgeItems" :key="item.id" class="knowledge-item">
                  <div class="knowledge-content">
                    <div class="question">Q: {{ item.question }}</div>
                    <div class="answer">A: {{ item.answer }}</div>
                  </div>
                  <div class="knowledge-actions">
                    <el-button size="small" @click="editKnowledge(item)">编辑</el-button>
                    <el-button size="small" type="success" @click="likeKnowledge(item)">👍</el-button>
                    <el-button size="small" type="danger" @click="dislikeKnowledge(item)">👎</el-button>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 无人模式 -->
    <div v-else class="auto-mode">
      <el-result
        icon="success"
        title="无人模式运行中"
        sub-title="系统正在全自动为用户提供服务，无需人工干预"
      >
        <template #extra>
          <div class="auto-metrics">
            <el-statistic title="今日自动回复" :value="autoMetrics.autoReplies" />
            <el-statistic title="回复准确率" :value="autoMetrics.accuracy" suffix="%" />
            <el-statistic title="平均响应时间" :value="autoMetrics.responseTime" suffix="秒" />
          </div>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface PendingItem {
  id: number
  type: 'comment' | 'presale'
  roomName: string
  username: string
  question: string
  interactions: number
  priority: 'normal' | 'high'
  time: Date
}

interface ChatMessage {
  id: number
  sender: 'user' | 'agent'
  content: string
  time: Date
}

const serviceMode = ref('manual')
const selectedItem = ref<PendingItem | null>(null)
const inputMessage = ref('')
const chatHistory = ref<ChatMessage[]>([])

const pendingList = ref<PendingItem[]>([
  {
    id: 1,
    type: 'presale',
    roomName: '美妆直播间',
    username: '小仙女123',
    question: '这个口红色号适合什么肤色？有没有试色？',
    interactions: 5,
    priority: 'high',
    time: new Date()
  },
  {
    id: 2,
    type: 'comment',
    roomName: '服装直播间',
    username: '时尚达人',
    question: '这件衣服的面料怎么样？会不会起球？',
    interactions: 3,
    priority: 'normal',
    time: new Date()
  }
])

const aiSuggestions = ref([
  {
    id: 1,
    content: '这款口红有多个色号可选，适合不同肤色。建议您根据个人肤色选择，我们有详细的试色图可以参考。'
  },
  {
    id: 2,
    content: '根据您的问题，这款产品非常适合您的需求，现在还有优惠活动。'
  }
])

const knowledgeItems = ref([
  {
    id: 1,
    question: '口红色号如何选择？',
    answer: '根据肤色选择：冷肤色选择粉调色号，暖肤色选择橘调色号，中性肤色选择范围较广。'
  },
  {
    id: 2,
    question: '化妆品的保质期多久？',
    answer: '一般化妆品未开封保质期3年，开封后建议12-24个月内使用完。'
  }
])

const autoMetrics = ref({
  autoReplies: 2847,
  accuracy: 94.5,
  responseTime: 1.2
})

const handleModeChange = (value: string) => {
  serviceMode.value = value
  selectedItem.value = null
}

const selectItem = (item: PendingItem) => {
  selectedItem.value = item
  // 模拟加载聊天记录
  chatHistory.value = []
}

const sendMessage = () => {
  if (!inputMessage.value.trim() || !selectedItem.value) return
  
  const message: ChatMessage = {
    id: Date.now(),
    sender: 'agent',
    content: inputMessage.value,
    time: new Date()
  }
  
  chatHistory.value.push(message)
  inputMessage.value = ''
}

const insertImage = () => {
  inputMessage.value += '[插入图片] '
}

const insertVideo = () => {
  inputMessage.value += '[插入视频] '
}

const insertLink = () => {
  inputMessage.value += '[插入购物链接] '
}

const startVoiceInput = () => {
  ElMessage.info('语音输入功能开发中...')
}

const editSuggestion = (suggestion: any) => {
  inputMessage.value = suggestion.content
}

const adoptSuggestion = (suggestion: any) => {
  inputMessage.value = suggestion.content
  sendMessage()
}

const editKnowledge = (item: any) => {
  ElMessage.info('编辑知识点功能开发中...')
}

const likeKnowledge = (item: any) => {
  ElMessage.success('已点赞该知识点')
}

const dislikeKnowledge = (item: any) => {
  ElMessage.warning('已标记该知识点')
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString()
}
</script>

<style scoped>
.customer-service {
  padding: 0;
}

.mode-selector {
  margin-bottom: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.full-height-card {
  height: 100%;
  border-radius: 8px;
}

.full-height-card :deep(.el-card__body) {
  height: calc(100% - 60px);
  overflow-y: auto;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.pending-list {
  height: 100%;
  overflow-y: auto;
}

.pending-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.pending-item:hover {
  border-color: #d9d9d9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pending-item.active {
  border-color: #1890ff;
  background-color: #f6ffed;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.priority {
  font-size: 14px;
}

.room-user {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.question {
  font-size: 14px;
  color: #262626;
  margin-bottom: 4px;
  line-height: 1.4;
}

.interactions {
  font-size: 12px;
  color: #1890ff;
}

.chat-workspace .card-header {
  align-items: center;
  gap: 12px;
}

.username {
  color: #1890ff;
  font-weight: 500;
  margin-left: 8px;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8c8c8c;
  font-size: 16px;
}

.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

.user-message, .message {
  margin-bottom: 16px;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.time {
  font-size: 12px;
  color: #8c8c8c;
}

.message-content {
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 80%;
}

.message-content.user {
  background-color: #f0f0f0;
  color: #262626;
}

.message-content.agent {
  background-color: #1890ff;
  color: white;
  margin-left: auto;
}

.input-area {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.input-tools {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.tool-buttons, .send-buttons {
  display: flex;
  gap: 8px;
}

.customer-summary {
  space-y: 12px;
}

.summary-item {
  margin-bottom: 12px;
  line-height: 1.5;
}

.label {
  font-weight: 500;
  color: #262626;
}

.question-list {
  margin-top: 4px;
}

.no-customer, .no-suggestions {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8c8c8c;
}

.ai-suggestions {
  space-y: 16px;
}

.suggestion-item {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 12px;
}

.suggestion-content {
  margin-bottom: 8px;
  color: #262626;
  line-height: 1.5;
}

.suggestion-actions {
  display: flex;
  gap: 8px;
}

.knowledge-feedback {
  max-height: 300px;
  overflow-y: auto;
}

.knowledge-item {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 12px;
}

.knowledge-content {
  margin-bottom: 8px;
}

.knowledge-content .question {
  color: #262626;
  margin-bottom: 4px;
  font-weight: 500;
}

.knowledge-content .answer {
  color: #52c41a;
  line-height: 1.5;
}

.knowledge-actions {
  display: flex;
  gap: 8px;
}

.auto-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
}

.auto-metrics {
  display: flex;
  gap: 60px;
  margin-top: 24px;
}

.auto-metrics :deep(.el-statistic__content) {
  font-size: 28px;
}

.auto-metrics :deep(.el-statistic__number) {
  color: #1890ff;
}
</style>