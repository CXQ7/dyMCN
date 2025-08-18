import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3000 });

// 当客户端连接时
wss.on("connection", (ws) => {
  console.log("客户端已连接");

  // 当接收到客户端的消息时
  ws.on("message", (message) => {
    console.log("收到消息: %s", message);

    // 将收到的消息发送回客户端
    ws.send(`服务器: 收到消息，内容是 ${message}`);
  });

  // 当连接关闭时
  ws.on("close", () => {
    console.log("客户端已断开连接");
  });

  // 模拟发送消息到客户端
  ws.send("欢迎连接到WebSocket服务器！");
  setInterval(() => {
    ws.send(Math.random());
  }, 1000);
});

console.log("WebSocket服务器正在监听3000端口...");