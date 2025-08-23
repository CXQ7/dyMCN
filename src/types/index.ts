export interface LiveRoom {
  id: string;
  name: string;
  onlineCount: number;
  status: "active" | "archived"; // 活跃或归档状态
}

export interface PendingQuestion {
  id: string;
  roomId: string;
  roomName: string;
  userName: string;
  question: string;
  timestamp: Date;
}

export interface AnsweredQuestion {
  id: string;
  roomId: string;
  roomName: string;
  userName: string;
  question: string;
  answer: string;
  timestamp: Date;
  answerTime: Date;
}

export interface Transaction {
  id: string;
  roomId: string;
  roomName: string;
  userName: string;
  answerTime: Date;
  orderTime: Date;
  amount: number;
  channel: "comment" | "presale";
  productName: string;
}

export interface RoomMetrics {
  roomId: string;
  roomName: string;
  pendingCount: number;
  answeredCount: number;
  knowledgeCount: number;
  conversionRate: number;
  presaleConversionRate: number; // 售前转化率
  commentConversionRate: number; // 评论互动转化率
  presaleAmount: number; // 售前转化成交金额
  commentAmount: number; // 评论转化成交金额
  onlineHistory: number[];
  newJoinHistory: number[]; // 每秒新进直播间人数历史数据
  commentResponseTime: number; // 评论应答时间均值（秒）
  presaleResponseTime: number; // 售前应答时间均值（秒）
  averageStayDuration: number; // 用户直播间停留时长均值（分钟）
  presaleLeadCount: number; // 直播间应答售前引流量
}

export interface TimeRange {
  label: string;
  value: string;
  days: number;
}

export interface QACandidate {
  id: string;
  question: string;
  answer: string;
  confidence: number;
  status: "pending" | "approved" | "rejected";
}

export interface ManualReply {
  id: string;
  roomId: string;
  roomName: string;
  userName: string;
  question: string;
  difficulty: "high" | "medium";
  timestamp: Date;
}

// 新增客服坐席相关类型
export interface ServiceQuestion {
  id: string;
  roomId: string;
  roomName: string;
  userName: string;
  question: string;
  type: "comment" | "presale";
  interactionCount: number;
  priority: "high" | "normal";
  hasHistory: boolean;
  timestamp: Date;
}

export interface CustomerInfo {
  userId: string;
  userName: string;
  visitCount: number;
  interactionCount: number;
  questionCount: number;
  previousQuestions: string[];
  orderHistory: CustomerOrder[];
  recentCommunications: string[];
}

export interface CustomerOrder {
  id: string;
  productName: string;
  amount: number;
  date: Date;
  status: "completed" | "pending" | "cancelled";
}

export interface AIAssistSuggestion {
  id: string;
  questionId: string;
  suggestedAnswer: string;
  confidence: number;
  source: "knowledge" | "history" | "pattern";
}

export interface ChatMessage {
  id: string;
  sender: "customer" | "agent";
  content: string;
  type: "text" | "image" | "video" | "link" | "voice";
  timestamp: Date;
  metadata?: {
    voiceCommand?: string;
    linkUrl?: string;
    imageUrl?: string;
    videoUrl?: string;
  };
}

// 知识库相关类型
export interface Document {
  id: string;
  name: string;
  type: "word" | "excel" | "pdf" | "text" | "asr";
  size: number;
  status: "processed" | "pending" | "processing";
  uploadDate: Date;
  roomId?: string;
  extractedQACount: number;
}

export interface KnowledgeItem {
  id: string;
  question: string;
  answer: string;
  source: string;
  upvotes: number;
  downvotes: number;
  usageCount: number;
  createdAt: Date;
  status: "active" | "inactive";
  roomId?: string;
}

// 用户认证相关类型
export interface User {
  id: string;
  username: string;
  role: UserRole;
  permissions: Permission[];
}

export type UserRole = "normal" | "operator" | "admin";

export type Permission =
  | "dashboard"
  | "customer-service"
  | "knowledge-base"
  | "settings"
  | "dycast";

// 设置相关类型
export interface FilterSettings {
  blockedUsers: string[];
  blockedKeywords: string[];
}

export interface SystemSettings {
  serviceMode: "auto" | "manual";
  aiAggressiveness: "passive" | "neutral" | "aggressive";
  orderCallbackUrl: string;
  enableKnowledgeFeedback: boolean;
  digitalAgentCount: number;
}

// 数字客服相关类型
export interface DigitalAgent {
  id: string;
  name: string;
  number: number;
  avatar: string;
  status: "online" | "busy" | "offline";
  specialties: string[];
  questionsHandled: number;
  successRate: number;
  averageResponseTime: number;
  createdAt: Date;
  lastActiveAt: Date;
  currentConversations: DigitalAgentConversation[];
}

export interface DigitalAgentConversation {
  id: string;
  agentId: string;
  roomId: string;
  roomName: string;
  customerName: string;
  customerInfo: CustomerInfo;
  messages: ChatMessage[];
  status: "active" | "resolved" | "escalated";
  startTime: Date;
  lastUpdateTime: Date;
  priority: "high" | "normal";
  tags: string[];
}
