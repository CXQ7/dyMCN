// TypeScript 版本的弹幕分析测试
import { cozeService } from "../utils/cozeService";

// 测试弹幕分析功能
async function testDanmuAnalysis() {
  console.log("开始测试弹幕分析...");

  const result = await cozeService.analyzeDanmu({
    live_room_id: 123,
    text: "直播间发放优惠券吗",
    check: false,
  });

  if (result.success) {
    console.log("弹幕分析成功:", result.data);
  } else {
    console.error("弹幕分析失败:", result.error);
  }
}

// 执行测试
testDanmuAnalysis().catch(console.error);
