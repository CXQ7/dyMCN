<template>
  <div class="dashboard">
    <!-- 顶部筛选器 -->
    <div class="filter-bar">
      <el-radio-group v-model="selectedRoom" @change="handleRoomChange">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button v-for="room in liveRooms" :key="room.id" :label="room.id">
          {{ room.name }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <el-row :gutter="24" class="dashboard-content">
      <!-- 左侧内容区 -->
      <el-col :span="16">
        <!-- 待应答功能 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">待应答</span>
              <el-badge :value="pendingCount" class="badge" />
            </div>
          </template>
          <div class="pending-list">
            <div 
              v-for="item in filteredPendingList" 
              :key="item.id" 
              class="pending-item"
            >
              <div class="item-header">
                <el-tag size="small" type="info">{{ item.roomName }}</el-tag>
                <span class="username">{{ item.username }}</span>
                <span class="time">{{ formatTime(item.time) }}</span>
              </div>
              <div class="item-content">{{ item.question }}</div>
            </div>
          </div>
        </el-card>

        <!-- 已应答历史 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">已应答历史</span>
            </div>
          </template>
          <div class="answered-list">
            <div 
              v-for="item in filteredAnsweredList" 
              :key="item.id" 
              class="answered-item"
            >
              <div class="item-header">
                <el-tag size="small" type="success">{{ item.roomName }}</el-tag>
                <span class="username">{{ item.username }}</span>
                <span class="time">{{ formatTime(item.time) }}</span>
              </div>
              <div class="item-content">
                <div class="question">问：{{ item.question }}</div>
                <div class="answer">答：{{ item.answer }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 成交关联 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">成交关联</span>
            </div>
          </template>
          <div class="transaction-list">
            <div 
              v-for="item in filteredTransactionList" 
              :key="item.id" 
              class="transaction-item"
            >
              <div class="item-header">
                <el-tag size="small" type="warning">{{ item.roomName }}</el-tag>
                <span class="username">{{ item.username }}</span>
              </div>
              <div class="item-content">
                <span class="label">应答时间：</span>{{ formatTime(item.answerTime) }}
                <br>
                <span class="label">下单时间：</span>{{ formatTime(item.orderTime) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧指标看板 -->
      <el-col :span="8">
        <!-- 整体指标 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">整体指标</span>
          </template>
          <div class="metrics-grid">
            <div class="metric-item">
              <div class="metric-label">待应答量</div>
              <div class="metric-value text-warning">{{ overallMetrics.pending }}</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">累计已应答量</div>
              <div class="metric-value text-success">{{ overallMetrics.answered }}</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">结构化知识量</div>
              <div class="metric-value text-info">{{ overallMetrics.knowledge }}</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">应答转化率</div>
              <div class="metric-value text-primary">{{ overallMetrics.conversionRate }}%</div>
            </div>
          </div>
          <div class="chart-container">
            <div class="chart-title">在线人数走势</div>
            <v-chart :option="onlineChartOption" style="height: 200px;" />
          </div>
        </el-card>

        <!-- 各直播间指标 -->
        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">各直播间指标</span>
          </template>
          <div class="room-metrics">
            <div v-for="room in roomMetrics" :key="room.id" class="room-metric-item">
              <div class="room-header">
                <el-tag size="small">{{ room.name }}</el-tag>
              </div>
              <div class="room-stats">
                <div class="stat">
                  <span class="stat-label">待应答：</span>
                  <span class="stat-value text-warning">{{ room.pending }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">已应答：</span>
                  <span class="stat-value text-success">{{ room.answered }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">知识量：</span>
                  <span class="stat-value text-info">{{ room.knowledge }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">转化率：</span>
                  <span class="stat-value text-primary">{{ room.conversionRate }}%</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([LineChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer])

// 数据定义
const selectedRoom = ref('all')
const timer = ref<NodeJS.Timeout | null>(null)

// 模拟数据
const liveRooms = ref([
  { id: 'room1', name: '美妆直播间' },
  { id: 'room2', name: '服装直播间' },
  { id: 'room3', name: '家居直播间' }
])

const pendingList = ref([
  { id: 1, roomName: '美妆直播间', username: '小仙女123', question: '这个口红色号适合什么肤色？', time: new Date(Date.now() - 2 * 60 * 1000), roomId: 'room1' },
  { id: 2, roomName: '服装直播间', username: '时尚达人', question: '这件衣服有L码吗？', time: new Date(Date.now() - 5 * 60 * 1000), roomId: 'room2' },
  { id: 3, roomName: '家居直播间', username: '居家小主', question: '这个杯子是什么材质的？', time: new Date(Date.now() - 1 * 60 * 1000), roomId: 'room3' }
])

const answeredList = ref([
  { id: 1, roomName: '美妆直播间', username: '小仙女123', question: '这个粉底液怎么选色号？', answer: '根据您的肤色，建议选择自然色号，可以先试用看看效果', time: new Date(Date.now() - 30 * 60 * 1000), roomId: 'room1' },
  { id: 2, roomName: '服装直播间', username: '时尚达人', question: '这件外套质量怎么样？', answer: '这款外套采用优质面料，做工精细，保暖性很好', time: new Date(Date.now() - 45 * 60 * 1000), roomId: 'room2' }
])

const transactionList = ref([
  { id: 1, roomName: '美妆直播间', username: '小仙女123', answerTime: new Date(Date.now() - 10 * 60 * 1000), orderTime: new Date(Date.now() - 5 * 60 * 1000), roomId: 'room1' },
  { id: 2, roomName: '服装直播间', username: '购物小能手', answerTime: new Date(Date.now() - 15 * 60 * 1000), orderTime: new Date(Date.now() - 8 * 60 * 1000), roomId: 'room2' }
])

const overallMetrics = ref({
  pending: 156,
  answered: 2340,
  knowledge: 450,
  conversionRate: 23.5
})

const roomMetrics = ref([
  { id: 'room1', name: '美妆直播间', pending: 68, answered: 890, knowledge: 150, conversionRate: 28.5 },
  { id: 'room2', name: '服装直播间', pending: 52, answered: 756, knowledge: 180, conversionRate: 21.2 },
  { id: 'room3', name: '家居直播间', pending: 36, answered: 694, knowledge: 120, conversionRate: 19.8 }
])

// 计算属性
const pendingCount = computed(() => filteredPendingList.value.length)

const filteredPendingList = computed(() => {
  if (selectedRoom.value === 'all') return pendingList.value
  return pendingList.value.filter(item => item.roomId === selectedRoom.value)
})

const filteredAnsweredList = computed(() => {
  if (selectedRoom.value === 'all') return answeredList.value
  return answeredList.value.filter(item => item.roomId === selectedRoom.value)
})

const filteredTransactionList = computed(() => {
  if (selectedRoom.value === 'all') return transactionList.value
  return transactionList.value.filter(item => item.roomId === selectedRoom.value)
})

// 图表配置
const onlineChartData = ref(Array.from({ length: 30 }, (_, i) => 
  Math.floor(Math.random() * 500) + 800 + i * 5
))

const onlineChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: Array.from({ length: 30 }, (_, i) => `${i}s`)
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    name: '在线人数',
    type: 'line',
    data: onlineChartData.value,
    smooth: true,
    lineStyle: {
      color: '#1890ff'
    },
    areaStyle: {
      color: 'rgba(24, 144, 255, 0.1)'
    }
  }]
}))

// 方法
const handleRoomChange = (value: string) => {
  selectedRoom.value = value
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60)
  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`
  return date.toLocaleString()
}

const updateData = () => {
  // 模拟实时数据更新
  onlineChartData.value.shift()
  onlineChartData.value.push(Math.floor(Math.random() * 500) + 800)
}

onMounted(() => {
  timer.value = setInterval(updateData, 3000)
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.filter-bar {
  margin-bottom: 24px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dashboard-content {
  min-height: calc(100vh - 200px);
}

.section-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.section-card :deep(.el-card__body) {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-weight: 600;
  color: #262626;
}

.badge :deep(.el-badge__content) {
  background-color: #ff4d4f;
}

/* 列表项样式 */
.pending-list, .answered-list, .transaction-list {
  space-y: 12px;
}

.pending-item, .answered-item, .transaction-item {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.2s;
}

.pending-item:hover, .answered-item:hover, .transaction-item:hover {
  border-color: #d9d9d9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.username {
  font-weight: 500;
  color: #1890ff;
}

.time {
  margin-left: auto;
  font-size: 12px;
  color: #8c8c8c;
}

.item-content {
  color: #595959;
  line-height: 1.5;
}

.question {
  margin-bottom: 4px;
  color: #595959;
}

.answer {
  color: #52c41a;
}

.label {
  font-weight: 500;
  color: #262626;
}

/* 指标网格 */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.metric-item {
  text-align: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.metric-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
}

.text-warning {
  color: #faad14;
}

.text-success {
  color: #52c41a;
}

.text-info {
  color: #13c2c2;
}

.text-primary {
  color: #1890ff;
}

.chart-container {
  margin-top: 16px;
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
}

/* 直播间指标 */
.room-metrics {
  space-y: 16px;
}

.room-metric-item {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 12px;
}

.room-header {
  margin-bottom: 8px;
}

.room-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.stat {
  font-size: 12px;
}

.stat-label {
  color: #8c8c8c;
}

.stat-value {
  font-weight: 500;
}
</style>