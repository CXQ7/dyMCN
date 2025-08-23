import {
  LiveRoom,
  PendingQuestion,
  AnsweredQuestion,
  Transaction,
  RoomMetrics,
  QACandidate,
  ManualReply,
  ServiceQuestion,
  CustomerInfo,
  CustomerOrder,
  AIAssistSuggestion,
  ChatMessage,
  Document,
  KnowledgeItem,
  SystemSettings,
  FilterSettings,
  DigitalAgent,
  DigitalAgentConversation,
  User,
  UserRole,
  Permission,
} from "@/types";

const liveRooms: LiveRoom[] = [
  { id: "1", name: "美妆直播间", onlineCount: 2543, status: "active" },
  { id: "2", name: "数码科技", onlineCount: 1876, status: "active" },
  { id: "3", name: "服饰搭配", onlineCount: 3210, status: "active" },
  { id: "4", name: "家居生活", onlineCount: 1432, status: "active" },
  { id: "5", name: "美食推荐", onlineCount: 2987, status: "active" },
  { id: "6", name: "户外运动", onlineCount: 1234, status: "archived" },
  { id: "7", name: "母婴用品", onlineCount: 987, status: "archived" },
];

const sampleQuestions = [
  "这个产品的保质期是多久？",
  "有什么颜色可以选择？",
  "能不能包邮？",
  "这个尺寸适合我吗？",
  "有现货吗？什么时候发货？",
  "能给个优惠吗？",
  "和其他品牌相比怎么样？",
  "使用方法是什么？",
  "有售后保障吗？",
  "支持七天无理由退换吗？",
];

const sampleAnswers = [
  "这款产品保质期为3年，请放心购买。",
  "目前有黑色、白色、粉色三种颜色可选。",
  "满99元包邮，目前正在优惠活动中。",
  "建议您参考尺码表，或者联系客服为您推荐。",
  "现货充足，今日下单明日发货。",
  "已经是活动价了，非常优惠。",
  "我们的产品在同价位中性价比最高。",
  "使用方法很简单，包装内有详细说明书。",
  "提供一年质保，有任何问题可联系售后。",
  "支持七天无理由退换，请保持包装完整。",
];

const userNames = [
  "小美",
  "阿强",
  "丽丽",
  "小王",
  "张三",
  "李四",
  "小红",
  "大明",
  "晓雪",
  "小刘",
  "小陈",
  "小林",
];

const productNames = [
  "美白面膜套装",
  "保湿精华液",
  "防晒霜SPF50+",
  "无线蓝牙耳机",
  "手机保护壳",
  "智能手环",
  "连衣裙",
  "牛仔外套",
  "运动鞋",
  "家用空气净化器",
  "电动牙刷",
  "咖啡豆礼盒",
  "有机蜂蜜",
  "茶叶礼盒",
];

function getRandomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(daysAgo: number = 0, hoursAgo: number = 24): Date {
  const now = new Date();
  const randomHours = Math.random() * hoursAgo;
  return new Date(
    now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - randomHours * 60 * 60 * 1000
  );
}

// 以下函数已迁移到真实数据服务，这里保留注释作为记录
// export function generatePendingQuestions() - 已迁移到 dataService.ts
// export function generateAnsweredQuestions() - 已迁移到 dataService.ts
// export function generateTransactions() - 已迁移到 dataService.ts
// export function generateRoomMetrics() - 已迁移到 dataService.ts

export function generateQACandidates(count: number = 8): QACandidate[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `qa-${i + 1}`,
    question: getRandomItem(sampleQuestions),
    answer: getRandomItem(sampleAnswers),
    confidence: Math.random() * 0.4 + 0.6,
    status: "pending" as const,
  }));
}

export function generateManualReplies(count: number = 6): ManualReply[] {
  return Array.from({ length: count }, (_, i) => {
    const room = getRandomItem(liveRooms);
    return {
      id: `manual-${i + 1}`,
      roomId: room.id,
      roomName: room.name,
      userName: getRandomItem(userNames),
      question: getRandomItem(sampleQuestions),
      difficulty: Math.random() > 0.5 ? "high" : "medium",
      timestamp: getRandomDate(0, 1),
    };
  });
}

export function generateSystemSettings(): SystemSettings {
  return {
    serviceMode: "auto",
    aiAggressiveness: "neutral",
    orderCallbackUrl: "https://api.example.com/callback",
    enableKnowledgeFeedback: true,
    digitalAgentCount: 2,
  };
}

export function generateServiceQuestions(
  count: number = 20
): ServiceQuestion[] {
  return Array.from({ length: count }, (_, i) => {
    const room = getRandomItem(liveRooms);
    return {
      id: `service-${i + 1}`,
      roomId: room.id,
      roomName: room.name,
      userName: getRandomItem(userNames),
      question: getRandomItem(sampleQuestions),
      type: Math.random() > 0.5 ? "comment" : "presale",
      interactionCount: Math.floor(Math.random() * 5) + 1,
      priority: Math.random() > 0.7 ? "high" : "normal",
      hasHistory: Math.random() > 0.5,
      timestamp: getRandomDate(0, 2),
    };
  });
}

export function generateCustomerInfo(userName: string): CustomerInfo {
  const orderHistory: CustomerOrder[] = Array.from(
    { length: Math.floor(Math.random() * 5) + 1 },
    (_, i) => ({
      id: `order-${i + 1}`,
      productName: getRandomItem(productNames),
      amount: Math.floor(Math.random() * 500) + 50,
      date: getRandomDate(Math.floor(Math.random() * 30) + 1),
      status: getRandomItem(["completed", "pending", "cancelled"] as const),
    })
  );

  return {
    userId: `user-${userName}`,
    userName,
    visitCount: Math.floor(Math.random() * 20) + 5,
    interactionCount: Math.floor(Math.random() * 15) + 3,
    questionCount: Math.floor(Math.random() * 10) + 2,
    previousQuestions: sampleQuestions.slice(
      0,
      Math.floor(Math.random() * 3) + 1
    ),
    orderHistory,
    recentCommunications: ["询问产品价格", "咨询发货时间", "要求退换货"].slice(
      0,
      Math.floor(Math.random() * 3) + 1
    ),
  };
}

export function generateAIAssistSuggestions(
  questionId: string,
  count: number = 3
): AIAssistSuggestion[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `suggestion-${questionId}-${i + 1}`,
    questionId,
    suggestedAnswer: getRandomItem(sampleAnswers),
    confidence: Math.random() * 0.4 + 0.6,
    source: getRandomItem(["knowledge", "history", "pattern"] as const),
  }));
}

export function generateChatMessages(count: number = 5): ChatMessage[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `msg-${i + 1}`,
    sender: i % 2 === 0 ? "customer" : "agent",
    content:
      i % 2 === 0
        ? getRandomItem(sampleQuestions)
        : getRandomItem(sampleAnswers),
    type: "text",
    timestamp: getRandomDate(0, 0.5),
  }));
}

const documentTypes = ["word", "excel", "pdf", "text", "asr"] as const;
const documentNames = [
  "产品手册.docx",
  "价格表.xlsx",
  "使用说明.pdf",
  "常见问题.txt",
  "直播录音.asr",
];

export function generateDocuments(count: number = 10): Document[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `doc-${i + 1}`,
    name: getRandomItem(documentNames),
    type: getRandomItem(documentTypes),
    size: Math.floor(Math.random() * 10000) + 1000,
    status: getRandomItem(["processed", "pending", "processing"] as const),
    uploadDate: getRandomDate(Math.floor(Math.random() * 7)),
    roomId: Math.random() > 0.3 ? getRandomItem(liveRooms).id : undefined,
    extractedQACount: Math.floor(Math.random() * 50) + 10,
  }));
}

export function generateKnowledgeItems(count: number = 20): KnowledgeItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `knowledge-${i + 1}`,
    question: getRandomItem(sampleQuestions),
    answer: getRandomItem(sampleAnswers),
    source: getRandomItem(documentNames),
    upvotes: Math.floor(Math.random() * 50),
    downvotes: Math.floor(Math.random() * 10),
    usageCount: Math.floor(Math.random() * 100),
    createdAt: getRandomDate(Math.floor(Math.random() * 30)),
    status: Math.random() > 0.1 ? "active" : "inactive",
    roomId: Math.random() > 0.3 ? getRandomItem(liveRooms).id : undefined,
  }));
}

export function generateFilterSettings(): FilterSettings {
  return {
    blockedUsers: ["恶意用户123", "广告机器人", "刷屏用户456"],
    blockedKeywords: [
      "垃圾",
      "骗子",
      "假货",
      "差评",
      "广告",
      "推广",
      "加微信",
      "外链",
    ],
  };
}

export function generateDigitalAgentConversations(
  agentId: string,
  count: number = 3
): DigitalAgentConversation[] {
  return Array.from({ length: count }, (_, i) => {
    const room = getRandomItem(liveRooms);
    const customerName = getRandomItem(userNames);
    const startTime = getRandomDate(0, 2);

    return {
      id: `conv-${agentId}-${i + 1}`,
      agentId,
      roomId: room.id,
      roomName: room.name,
      customerName,
      customerInfo: generateCustomerInfo(customerName),
      messages: generateChatMessages(Math.floor(Math.random() * 8) + 3),
      status: getRandomItem(["active", "resolved", "escalated"] as const),
      startTime,
      lastUpdateTime: new Date(
        startTime.getTime() + Math.random() * 60 * 60 * 1000
      ),
      priority: Math.random() > 0.7 ? "high" : "normal",
      tags: getRandomItem([
        ["售前咨询"],
        ["订单问题", "退换货"],
        ["产品介绍", "价格咨询"],
        ["技术支持"],
        ["物流查询"],
        ["会员服务"],
      ]),
    };
  });
}

export function generateDigitalAgents(count: number = 3): DigitalAgent[] {
  const agentNames = [
    "小艾",
    "小智",
    "小助",
    "小宁",
    "小慧",
    "小博",
    "小优",
    "小雅",
  ];
  const specialties = [
    ["售前咨询", "产品介绍"],
    ["订单处理", "售后服务"],
    ["技术支持", "使用指导"],
    ["价格咨询", "优惠活动"],
    ["物流查询", "发货时间"],
    ["退换货", "投诉处理"],
    ["会员服务", "积分查询"],
    ["品牌介绍", "产品对比"],
  ];

  return Array.from({ length: count }, (_, i) => {
    const name = agentNames[i] || `客服${i + 1}`;
    const agentId = `agent-${i + 1}`;
    return {
      id: agentId,
      name,
      number: i + 1,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      status: getRandomItem(["online", "busy", "offline"] as const),
      specialties: getRandomItem(specialties),
      questionsHandled: Math.floor(Math.random() * 1000) + 100,
      successRate: Math.floor(Math.random() * 20) + 80, // 80-99%
      averageResponseTime: Math.floor(Math.random() * 10) + 2, // 2-12秒
      createdAt: getRandomDate(Math.floor(Math.random() * 30) + 1),
      lastActiveAt: getRandomDate(0, 2),
      currentConversations: generateDigitalAgentConversations(
        agentId,
        Math.floor(Math.random() * 4) + 1
      ),
    };
  });
}

// 用户认证数据
const users: User[] = [
  {
    id: "user-1",
    username: "zhangsan01",
    role: "normal",
    permissions: ["dashboard", "knowledge-base", "dycast"],
  },
  {
    id: "user-2",
    username: "lisi01",
    role: "operator",
    permissions: ["dashboard", "customer-service", "knowledge-base", "dycast"],
  },
  {
    id: "user-3",
    username: "wangwu01",
    role: "admin",
    permissions: [
      "dashboard",
      "customer-service",
      "knowledge-base",
      "settings",
      "dycast",
    ],
  },
];

const userCredentials: Record<string, string> = {
  zhangsan01: "mcn2025",
  lisi01: "mcn2025",
  wangwu01: "mcn2025",
};

export function authenticateUser(
  username: string,
  password: string
): User | null {
  if (userCredentials[username] && userCredentials[username] === password) {
    return users.find((user) => user.username === username) || null;
  }
  return null;
}

export function getUserRoleLabel(role: UserRole): string {
  switch (role) {
    case "normal":
      return "普通用户";
    case "operator":
      return "运营账号";
    case "admin":
      return "管理员";
    default:
      return "未知";
  }
}

// 注意：liveRooms 现在从 Supabase 获取，不再从这里导出
// export { liveRooms };
