<template>
  <div class="settings">
    <el-tabs v-model="activeTab" class="settings-tabs">
      <!-- 服务配置 -->
      <el-tab-pane label="服务配置" name="service">
        <el-card shadow="never" class="settings-card">
          <div class="setting-section">
            <h3 class="section-title">客服模式配置</h3>
            <el-form :model="serviceConfig" label-width="180px">
              <el-form-item label="运营模式">
                <el-radio-group v-model="serviceConfig.operationMode">
                  <el-radio label="manual">有人工运营客服</el-radio>
                  <el-radio label="auto">无人工运营客服</el-radio>
                </el-radio-group>
                <div class="form-help">选择客服运营模式，有人工模式需要配置坐席人员</div>
              </el-form-item>
              
              <el-form-item label="AI接待主动性" v-if="serviceConfig.operationMode === 'manual'">
                <el-radio-group v-model="serviceConfig.aiInitiative">
                  <el-radio label="passive">消极（能不回答就不回答）</el-radio>
                  <el-radio label="neutral">中性（能回答的才回答）</el-radio>
                  <el-radio label="active">积极（尽量尝试回答）</el-radio>
                </el-radio-group>
                <div class="form-help">默认中性模式，影响AI自动回复的积极程度</div>
              </el-form-item>
              
              <el-form-item label="看板显示设置">
                <el-switch
                  v-model="serviceConfig.showKnowledgeFeedback"
                  active-text="显示结构化知识挖掘反馈"
                  inactive-text="显示下单反馈"
                />
                <div class="form-help">当未配置订单反馈接口时，可开启避免运营看板空栏</div>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 过滤设置 -->
      <el-tab-pane label="过滤设置" name="filter">
        <el-card shadow="never" class="settings-card">
          <div class="setting-section">
            <h3 class="section-title">过滤名单</h3>
            <div class="filter-section">
              <div class="section-header">
                <span>过滤用户列表</span>
                <el-button type="primary" size="small" @click="addFilterUser">
                  <el-icon><Plus /></el-icon>
                  添加用户
                </el-button>
              </div>
              <div class="filter-list">
                <div v-for="user in filterConfig.users" :key="user.id" class="filter-item">
                  <div class="filter-content">
                    <el-tag>{{ user.username }}</el-tag>
                    <span class="filter-reason">{{ user.reason }}</span>
                  </div>
                  <el-button size="small" type="danger" @click="removeFilterUser(user.id)">
                    删除
                  </el-button>
                </div>
              </div>
              <div class="empty-state" v-if="filterConfig.users.length === 0">
                暂无过滤用户
              </div>
            </div>
          </div>

          <div class="setting-section">
            <h3 class="section-title">过滤关键词</h3>
            <div class="filter-section">
              <div class="section-header">
                <span>关键词列表</span>
                <el-button type="primary" size="small" @click="addFilterKeyword">
                  <el-icon><Plus /></el-icon>
                  添加关键词
                </el-button>
              </div>
              <div class="keyword-tags">
                <el-tag
                  v-for="keyword in filterConfig.keywords"
                  :key="keyword"
                  closable
                  @close="removeKeyword(keyword)"
                  style="margin: 4px;"
                >
                  {{ keyword }}
                </el-tag>
              </div>
              <div class="empty-state" v-if="filterConfig.keywords.length === 0">
                暂无过滤关键词
              </div>
            </div>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 接口设置 -->
      <el-tab-pane label="接口设置" name="api">
        <el-card shadow="never" class="settings-card">
          <div class="setting-section">
            <h3 class="section-title">下单反馈接口</h3>
            <el-form :model="apiConfig" label-width="120px">
              <el-form-item label="接口地址">
                <el-input v-model="apiConfig.orderCallbackUrl" placeholder="https://api.example.com/order/callback" />
                <div class="form-help">用于接收下单反馈数据的API接口地址</div>
              </el-form-item>
              
              <el-form-item label="认证方式">
                <el-select v-model="apiConfig.authType" placeholder="选择认证方式">
                  <el-option label="无认证" value="none" />
                  <el-option label="API Key" value="apikey" />
                  <el-option label="Bearer Token" value="bearer" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="认证密钥" v-if="apiConfig.authType !== 'none'">
                <el-input v-model="apiConfig.authKey" type="password" show-password placeholder="请输入认证密钥" />
              </el-form-item>
              
              <el-form-item label="超时时间(秒)">
                <el-input-number v-model="apiConfig.timeout" :min="1" :max="60" />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="testApiConnection">测试连接</el-button>
                <el-button @click="saveApiConfig">保存配置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 高级设置 -->
      <el-tab-pane label="高级设置" name="advanced">
        <el-card shadow="never" class="settings-card">
          <div class="setting-section">
            <h3 class="section-title">系统配置</h3>
            <el-form :model="advancedConfig" label-width="150px">
              <el-form-item label="数字客服数量">
                <el-input-number v-model="advancedConfig.aiAgentCount" :min="1" :max="100" />
                <div class="form-help">同时在线的AI客服数量</div>
              </el-form-item>
              
              <el-form-item label="数据保留时间(天)">
                <el-input-number v-model="advancedConfig.dataRetentionDays" :min="30" :max="365" />
                <div class="form-help">系统数据的保留时间，超过时间将自动清理</div>
              </el-form-item>
            </el-form>
          </div>

          <div class="setting-section">
            <h3 class="section-title">数据管理</h3>
            <div class="data-management">
              <div class="management-item">
                <div class="item-info">
                  <h4>数据导出</h4>
                  <p>导出系统中的聊天记录、知识库等数据</p>
                </div>
                <el-button type="primary" @click="exportData">导出数据</el-button>
              </div>
              
              <div class="management-item">
                <div class="item-info">
                  <h4>系统日志</h4>
                  <p>查看和下载系统运行日志</p>
                </div>
                <el-button @click="viewLogs">查看日志</el-button>
              </div>
              
              <div class="management-item">
                <div class="item-info">
                  <h4>清理缓存</h4>
                  <p>清理系统缓存以释放存储空间</p>
                </div>
                <el-button type="warning" @click="clearCache">清理缓存</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 添加过滤用户对话框 -->
    <el-dialog v-model="userDialogVisible" title="添加过滤用户" width="400px">
      <el-form :model="userForm" label-width="80px">
        <el-form-item label="用户名" required>
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="过滤原因">
          <el-input v-model="userForm.reason" placeholder="请输入过滤原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFilterUser">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加关键词对话框 -->
    <el-dialog v-model="keywordDialogVisible" title="添加过滤关键词" width="400px">
      <el-form :model="keywordForm" label-width="80px">
        <el-form-item label="关键词" required>
          <el-input v-model="keywordForm.keyword" placeholder="请输入关键词" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="keywordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFilterKeyword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface FilterUser {
  id: number
  username: string
  reason: string
}

const activeTab = ref('service')
const userDialogVisible = ref(false)
const keywordDialogVisible = ref(false)

// 服务配置
const serviceConfig = ref({
  operationMode: 'manual',
  aiInitiative: 'neutral',
  showKnowledgeFeedback: false
})

// 过滤配置
const filterConfig = ref({
  users: [
    { id: 1, username: '水军001', reason: '营销账号' },
    { id: 2, username: 'spam_user', reason: '垃圾信息' }
  ] as FilterUser[],
  keywords: ['广告', '刷单', '垃圾', '违禁词']
})

// API配置
const apiConfig = ref({
  orderCallbackUrl: '',
  authType: 'none',
  authKey: '',
  timeout: 30
})

// 高级配置
const advancedConfig = ref({
  aiAgentCount: 5,
  dataRetentionDays: 90
})

// 表单数据
const userForm = ref({
  username: '',
  reason: ''
})

const keywordForm = ref({
  keyword: ''
})

// 方法
const addFilterUser = () => {
  userForm.value = { username: '', reason: '' }
  userDialogVisible.value = true
}

const saveFilterUser = () => {
  if (!userForm.value.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  
  const newUser: FilterUser = {
    id: Date.now(),
    username: userForm.value.username,
    reason: userForm.value.reason
  }
  
  filterConfig.value.users.push(newUser)
  userDialogVisible.value = false
  ElMessage.success('添加成功')
}

const removeFilterUser = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个过滤用户吗？', '确认删除', {
      type: 'warning'
    })
    
    const index = filterConfig.value.users.findIndex(u => u.id === id)
    if (index > -1) {
      filterConfig.value.users.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    ElMessage.info('已取消删除')
  }
}

const addFilterKeyword = () => {
  keywordForm.value = { keyword: '' }
  keywordDialogVisible.value = true
}

const saveFilterKeyword = () => {
  if (!keywordForm.value.keyword.trim()) {
    ElMessage.warning('请输入关键词')
    return
  }
  
  if (filterConfig.value.keywords.includes(keywordForm.value.keyword)) {
    ElMessage.warning('关键词已存在')
    return
  }
  
  filterConfig.value.keywords.push(keywordForm.value.keyword)
  keywordDialogVisible.value = false
  ElMessage.success('添加成功')
}

const removeKeyword = (keyword: string) => {
  const index = filterConfig.value.keywords.indexOf(keyword)
  if (index > -1) {
    filterConfig.value.keywords.splice(index, 1)
  }
}

const testApiConnection = async () => {
  if (!apiConfig.value.orderCallbackUrl) {
    ElMessage.warning('请先输入接口地址')
    return
  }
  
  ElMessage.info('正在测试连接...')
  // 模拟API测试
  setTimeout(() => {
    ElMessage.success('连接测试成功')
  }, 2000)
}

const saveApiConfig = () => {
  ElMessage.success('API配置保存成功')
}

const exportData = () => {
  ElMessage.info('数据导出功能开发中...')
}

const viewLogs = () => {
  ElMessage.info('日志查看功能开发中...')
}

const clearCache = async () => {
  try {
    await ElMessageBox.confirm('确定要清理系统缓存吗？', '确认操作', {
      type: 'warning'
    })
    
    ElMessage.success('缓存清理完成')
  } catch {
    ElMessage.info('已取消操作')
  }
}
</script>

<style scoped>
.settings {
  padding: 0;
}

.settings-tabs {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.settings-card {
  border: none;
  box-shadow: none;
}

.setting-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.setting-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.form-help {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
  line-height: 1.4;
}

.filter-section {
  background: #fafafa;
  padding: 16px;
  border-radius: 6px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 500;
  color: #262626;
}

.filter-list {
  space-y: 8px;
}

.filter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 4px;
  margin-bottom: 8px;
}

.filter-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-reason {
  color: #8c8c8c;
  font-size: 12px;
}

.keyword-tags {
  min-height: 40px;
  background: white;
  padding: 8px;
  border-radius: 4px;
}

.empty-state {
  text-align: center;
  color: #8c8c8c;
  padding: 20px;
  background: white;
  border-radius: 4px;
}

.data-management {
  space-y: 16px;
}

.management-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  margin-bottom: 16px;
}

.item-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: #262626;
}

.item-info p {
  margin: 0;
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.4;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #262626;
}

:deep(.el-radio__label) {
  font-size: 14px;
  color: #595959;
}

:deep(.el-switch__text) {
  font-size: 14px;
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