// @ts-ignore
import { supabase } from "@/configs/supabase";
import { DyCast, CastMethod } from "../core/dycast";
// @ts-ignore
import wsConfig from "../configs/wsconfig";
import { danmuAnalysisService } from "@/services/danmuAnalysisService";

// 定义弹幕转发数据结构
interface ForwardMessage {
  room_id: string;
  method: string;
  content: string;
  timestamp: number;
  user_info?: {
    nickname: string;
    avatar: string;
  };
  gift_info?: {
    name: string;
    price: number;
    count: number;
  };
}

// 定义直播间状态
type RoomStatus = "preparing" | "living" | "ended";

// 定义在线人数更新回调
type OnlineCountCallback = (roomId: string, count: number) => void;

class LiveRoomMonitor {
  private activeConnections: Map<string, DyCast> = new Map();
  private wsConnection: WebSocket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private shouldReconnect: boolean = false;
  private isMonitoringActive: boolean = false;
  private onlineCountCallbacks: Set<OnlineCountCallback> = new Set();
  private roomOnlineCounts: Map<string, number> = new Map();


  // 初始化WebSocket连接
  private async initWebSocket() {
    try {
      const wsUrl = `ws://${wsConfig.server.host}:${wsConfig.server.port}`;
      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.onopen = () => {
        console.log("WebSocket连接已建立");
        if (this.isMonitoringActive) {
          this.startRoomConnections();
        }
      };

      this.wsConnection.onclose = () => {
        if (this.shouldReconnect) {
          console.warn("WebSocket连接已关闭，5秒后重试...");
          this.reconnectInterval = setTimeout(() => this.initWebSocket(), 5000);
        } else {
          console.info("WebSocket连接已关闭，不再重连");
        }
      };

      this.wsConnection.onerror = (err) => {
        console.error("WebSocket连接错误:", err);
      };
    } catch (err) {
      console.error("初始化WebSocket失败:", err);
    }
  }

  // 开始监控直播间
  public async startMonitoring(): Promise<void> {
    this.shouldReconnect = true;
    this.isMonitoringActive = true;
    await this.startRoomConnections();

    // 如果WebSocket未连接，先初始化
    if (!this.wsConnection || this.wsConnection.readyState !== WebSocket.OPEN) {
      this.initWebSocket();
      // 等待连接建立
      return new Promise((resolve) => {
        const checkConnection = () => {
          if (this.wsConnection?.readyState === WebSocket.OPEN) {
            this.startRoomConnections();
            resolve();
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }
  }

  // 开始连接直播间
  private async startRoomConnections() {
    try {
      // 从Supabase获取所有直播间
      const { data: liveRooms, error } = await supabase
        .from("live_rooms")
        .select("id, platform_id, name, status");

      if (error) {
        console.error("获取直播间列表失败:", error);
        return;
      }

      if (!liveRooms || liveRooms.length === 0) {
        console.info("没有需要监控的直播间");
        return;
      }

      console.info(`开始监控${liveRooms.length}个直播间`);

      // 为每个直播间创建连接
      for (const room of liveRooms) {
        this.monitorRoom(room.platform_id);
      }
    } catch (err) {
      console.error("监控启动失败:", err);
    }
  }

  // 监控单个直播间
  private async monitorRoom(platformId: string) {
    // 如果已有连接则跳过
    if (this.activeConnections.has(platformId)) {
      return;
    }

    const cast = new DyCast(platformId);
    this.activeConnections.set(platformId, cast);

    cast.on("open", async (_, info) => {
      console.info(`直播间[${platformId}]连接成功`);

      // 更新数据库状态为正在直播
      await this.updateRoomStatus(platformId, "living");

      // 发送直播间信息
      if (this.wsConnection?.readyState === WebSocket.OPEN) {
        this.wsConnection.send(
          JSON.stringify({
            type: "room_info",
            room_id: platformId,
            info: {
              title: info?.title,
              cover: info?.cover,
              nickname: info?.nickname,
              online_count: 0, // 初始设为0，等待member_count事件更新
            },
            timestamp: Date.now(),
          })
        );
      }
    });

    cast.on("close", async (code) => {
      console.info(`直播间[${platformId}]连接关闭`);

      // 根据关闭代码更新状态
      let status: RoomStatus = "ended";
      if (code === 1006) {
        // DyCastCloseCode.LIVE_END 的等效值
        status = "ended";
      } else if (code === 1000) {
        // DyCastCloseCode.NORMAL 的等效值
        status = "preparing";
      }

      await this.updateRoomStatus(platformId, status);
      this.activeConnections.delete(platformId);
    });

    cast.on("error", (err) => {
      console.error(`直播间[${platformId}]连接错误:`, err);
    });

    cast.on("message", (messages) => {
      // 转发弹幕消息
      messages.forEach((msg) => {
        // 检查是否是在线人数更新消息
        if (
          msg.method === CastMethod.ROOM_STATS &&
          msg.room?.audienceCount !== undefined
        ) {
          const count =
            typeof msg.room.audienceCount === "string"
              ? parseInt(msg.room.audienceCount)
              : msg.room.audienceCount;
          this.updateOnlineCount(platformId, count);
        }

        // 也检查其他可能包含在线人数的消息
        if (
          msg.method === CastMethod.MEMBER &&
          msg.room?.audienceCount !== undefined
        ) {
          const count =
            typeof msg.room.audienceCount === "string"
              ? parseInt(msg.room.audienceCount)
              : msg.room.audienceCount;
          this.updateOnlineCount(platformId, count);
        }

        const forwardMsg: ForwardMessage = {
          room_id: platformId,
          method: msg.method || "",
          content: msg.content || "",
          timestamp: Date.now(),
        };

        // 添加用户信息
        if (msg.user) {
          forwardMsg.user_info = {
            nickname: msg.user.name || "",
            avatar: msg.user.avatar || "",
          };
        }

        // 添加礼物信息
        if (msg.method === CastMethod.GIFT && msg.gift) {
          forwardMsg.gift_info = {
            name: msg.gift.name || "",
            price: msg.gift.price || 0,
            count:
              typeof msg.gift.count === "number"
                ? msg.gift.count
                : parseInt(String(msg.gift.count)) || 1,
          };
        }

        // 如果WebSocket连接已打开，则发送消息
        if (this.wsConnection?.readyState === WebSocket.OPEN) {
          this.wsConnection.send(JSON.stringify(forwardMsg));
        }

        // 只对聊天消息进行分析
        if (msg.method === CastMethod.CHAT) {
          this.processDanmuAnalysis(forwardMsg);
        }
      });
    });

    cast.connect();
  }

  // 更新在线人数
  private updateOnlineCount(roomId: string, count: number) {
    console.log(`[LiveRoomMonitor] 更新在线人数: ${roomId} -> ${count}`);
    this.roomOnlineCounts.set(roomId, count);
    // 通知所有订阅者
    this.onlineCountCallbacks.forEach((callback) => {
      try {
        callback(roomId, count);
      } catch (error) {
        console.error("在线人数回调执行失败:", error);
      }
    });
  }

  // 处理弹幕分析
  private processDanmuAnalysis(forwardMsg: ForwardMessage): void {
    // 异步处理弹幕分析，不阻塞主流程
    danmuAnalysisService
      .processDanmu({
        room_id: forwardMsg.room_id,
        method: forwardMsg.method,
        content: forwardMsg.content,
        timestamp: forwardMsg.timestamp,
        user_info: forwardMsg.user_info,
      })
      .catch((error) => {
        console.error(`[LiveRoomMonitor] 弹幕分析处理失败:`, error);
      });
  }

  // 订阅在线人数更新
  public subscribeToOnlineCount(callback: OnlineCountCallback) {
    this.onlineCountCallbacks.add(callback);

    // 返回取消订阅函数
    return () => {
      this.onlineCountCallbacks.delete(callback);
    };
  }

  // 获取直播间当前在线人数
  public getOnlineCount(roomId: string): number | undefined {
    return this.roomOnlineCounts.get(roomId);
  }

  // 获取所有直播间在线人数
  public getAllOnlineCounts(): Map<string, number> {
    const counts = new Map(this.roomOnlineCounts);
    console.log(
      `[LiveRoomMonitor] getAllOnlineCounts:`,
      Array.from(counts.entries())
    );
    return counts;
  }

  // 更新直播间状态
  private async updateRoomStatus(platformId: string, status: RoomStatus) {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "living") {
        updateData.start_time = new Date().toISOString();
      } else if (status === "ended") {
        updateData.end_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from("live_rooms")
        .update(updateData)
        .eq("platform_id", platformId);

      if (error) {
        console.error(`更新直播间[${platformId}]状态失败:`, error);
      } else {
        console.debug(`直播间[${platformId}]状态更新为: ${status}`);
      }
    } catch (err) {
      console.error(`更新直播间[${platformId}]状态异常:`, err);
    }
  }

  // 停止所有监控
  // 获取活跃连接数
  public getActiveRoomsCount(): number {
    return this.activeConnections.size;
  }

  // 获取监控状态
  public isActive(): boolean {
    return this.isMonitoringActive;
  }

  public async stopMonitoring(): Promise<void> {
    this.shouldReconnect = false;
    this.isMonitoringActive = false;

    this.activeConnections.forEach((cast, platformId) => {
      cast.close();
    });
    this.activeConnections.clear();

    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }

    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  // 获取监控状态
  public isMonitoring(): boolean {
    return this.isMonitoringActive;
  }

  // 获取连接的直播间数量
  public getActiveConnectionsCount(): number {
    return this.activeConnections.size;
  }

  // 获取连接的直播间列表
  public getActiveRooms(): string[] {
    return Array.from(this.activeConnections.keys());
  }
}

// 导出单例实例
export const liveRoomMonitor = new LiveRoomMonitor();
