// 弹幕分析服务测试
import { danmuAnalysisService } from "../services/danmuAnalysisService";
import { pendingQuestionsService } from "../services/pendingQuestionsService";

// 测试弹幕分析功能
async function testDanmuAnalysisService() {
  console.log("开始测试弹幕分析服务...");

  // 模拟弹幕消息
  const testMessages = [
    {
      room_id: "530067220735", // 使用存在的直播间ID
      method: "WebcastChatMessage",
      content: "这个产品有什么优惠吗？",
      timestamp: Date.now(),
      user_info: {
        nickname: "测试用户1",
        avatar: "https://example.com/avatar1.jpg",
      },
    },
    {
      room_id: "530067220735",
      method: "WebcastChatMessage",
      content: "666666 主播好棒！",
      timestamp: Date.now(),
      user_info: {
        nickname: "测试用户2",
        avatar: "https://example.com/avatar2.jpg",
      },
    },
    {
      room_id: "530067220735",
      method: "WebcastChatMessage",
      content: "请问有包邮吗？",
      timestamp: Date.now(),
      user_info: {
        nickname: "测试用户3",
        avatar: "https://example.com/avatar3.jpg",
      },
    },
  ];

  console.log("处理测试弹幕消息...");

  // 逐个处理弹幕消息
  for (const message of testMessages) {
    console.log(`处理弹幕: ${message.user_info.nickname} - ${message.content}`);
    try {
      await danmuAnalysisService.processDanmu(message);
      console.log(`✓ 弹幕处理完成: ${message.content}`);
      // 等待一下避免API调用过快
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`✗ 处理弹幕失败: ${message.content}`, error);
    }
  }

  // 等待一段时间让处理完成
  console.log("等待处理完成...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // 检查待应答问题
  console.log("查询待应答问题...");
  try {
    const pendingQuestions =
      await pendingQuestionsService.getAllPendingQuestions();
    console.log(`找到 ${pendingQuestions.length} 个待应答问题:`);

    pendingQuestions.forEach((question, index) => {
      console.log(
        `${index + 1}. [${question.roomName}] ${question.userName}: ${
          question.question
        }`
      );
    });

    // 获取统计信息
    const stats = await pendingQuestionsService.getPendingQuestionsStats();
    console.log("统计信息:", stats);
  } catch (error) {
    console.error("查询待应答问题失败:", error);
  }
}

// 执行测试
testDanmuAnalysisService().catch(console.error);
