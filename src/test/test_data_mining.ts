// TypeScript 版本的数据挖掘测试
import { cozeService } from "../utils/cozeService";

// 测试数据挖掘功能
async function testDataMining() {
  console.log("开始测试数据挖掘...");

  const result = await cozeService.mineData({
    file: "https://p26-bot-workflow-sign.byteimg.com/tos-cn-i-mdko3gqilj/bc2056f5e87144edb2d38968f8ff5b39.txt~tplv-mdko3gqilj-image.image?rk3s=81d4c505&x-expires=1786586645&x-signature=43%2BjajfuHylJ4YP1AjL4VLjHQxI%3D&x-wf-file_name=Redmi+K60%E6%96%87%E6%A1%A3.txt",
    live_room_id: 1000,
  });

  if (result.success) {
    console.log("数据挖掘成功:", result.data);
  } else {
    console.error("数据挖掘失败:", result.error);
  }
}

// 执行测试
testDataMining().catch(console.error);
