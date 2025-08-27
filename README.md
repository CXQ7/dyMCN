# 📋 项目概览
项目名称: dymcn-frontend

技术栈: React + TypeScript + Vite + Tailwind CSS + Node.js WebSocket

功能定位: 抖音副播助手系统，提供直播间监控、弹幕分析、AI客服等功能

# 🏗️ 项目架构
## 🔧 核心技术栈
前端框架: React 18 + TypeScript

构建工具: Vite 6

样式: Tailwind CSS + Radix UI组件

状态管理: React Hooks

WebSocket: ws库

AI集成: @coze/api

数据库: Supabase（/Coze）

图表: Recharts
## 📂 源码结构 (src)
### 🎯 主要页面 (pages/)
```
├── DashboardPage.tsx      # 仪表板主页
├── CustomerServicePage.tsx # 客服工作台
├── DycastPage.tsx        # 直播监控页面
├── KnowledgeBasePage.tsx # 知识库管理
├── LoginPage.tsx         # 登录页面
└── SettingsPage.tsx      # 系统设置
```
### 🧩 核心组件 (components/)
```
├── Navigation.tsx         # 主导航
├── Dashboard.tsx         # 仪表板组件
├── AnsweredHistory.tsx   # 回答历史
├── PendingQuestions.tsx  # 待处理问题
├── ManualIntervention.tsx # 人工干预
├── RoomFilter.tsx        # 直播间筛选
├── TransactionRelation.tsx # 交易关系
└── customer-service/     # 客服系统组件
    ├── AIAssistant.tsx   # AI助手
    ├── ChatWorkspace.tsx # 聊天工作区
    ├── DigitalAgentManager.tsx # 数字代理管理
    └── ServiceQuestionList.tsx # 服务问题列表
```
### 🎨 UI组件库 (components/ui/)
基于 Radix UI 的完整组件系统：

表单组件：input.tsx, button.tsx, select.tsx

布局组件：card.tsx, dialog.tsx, sheet.tsx

导航组件：tabs.tsx, navigation-menu.tsx

数据展示：table.tsx, chart.tsx, progress.tsx

### 🎮 抖音直播核心 (dycast/)
```
├── core/
│   ├── dycast.ts         # 直播连接核心类
│   ├── emitter.ts        # 事件发射器
│   ├── emoji.ts          # 表情处理
│   └── model.ts          # 数据模型
├── components/
│   ├── DycastPanel.tsx   # 直播面板
│   └── MonitorSwitch.tsx # 监控开关
├── services/             # 直播服务
├── hooks/               # 直播相关Hook
└── utils/               # 工具函数
```
### 🔌 服务层 (services/)
```
├── danmuAnalysisService.ts    # 弹幕分析服务
├── dataService.ts            # 数据服务
├── liveRoomService.ts        # 直播间服务
└── pendingQuestionsService.ts # 待处理问题服务
```
### ⚙️ 配置 (configs/)
```
├── coze.ts              # 扣子AI配置
└── supabase.ts          # Supabase数据库配置
```
### 🎣 自定义Hook (hooks/)
```
├── useLiveRooms.ts      # 直播间数据Hook
├── useOnlineCounts.ts   # 在线人数Hook
└── useRealData.ts       # 实时数据Hook
```
### 🧪 测试 (test/)
```
├── test_danmu_analysis.ts        # 弹幕分析测试
├── test_danmu_analysis_service.ts # 弹幕分析服务测试
└── test_data_mining.ts           # 数据挖掘测试
```

## 🔄 数据流

WebSocket服务器 (server.js) - 端口3000

直播数据采集 (dycast/core/) - 连接抖音直播间

数据处理 (services/) - 分析和存储

AI处理 (configs/coze.ts) - 知识库挖掘

前端展示 (components/) - 用户界面

# 🛠️ 开发命令
```
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run test:danmu   # 测试弹幕分析
npm run test:mining  # 测试数据挖掘
```