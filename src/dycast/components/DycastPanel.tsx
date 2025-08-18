// src/dycast/components/DycastPanel.tsx
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DyCast, CastMethod } from "../core/dycast";
import { useTimeCounter } from "../hooks/useTimeCounter";
import type { DyMessage, DyLiveInfo } from "../core/dycast";
import { toast } from "sonner";
import { liveRoomMonitor } from "../services/liveRoomMonitor";
import { MonitorSwitch } from "./MonitorSwitch";

// 数字格式化函数
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + "万";
  }
  return num.toLocaleString();
};

export const DycastPanel: React.FC = () => {
  const [roomNum, setRoomNum] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [messages, setMessages] = useState<DyMessage[]>([]);
  const [liveInfo, setLiveInfo] = useState<DyLiveInfo | null>(null);
  const [monitorEnabled, setMonitorEnabled] = useState(false);
  const [activeRoomsCount, setActiveRoomsCount] = useState(0);
  const [stats, setStats] = useState({
    chatCount: 0,
    giftCount: 0,
    likeCount: 0,
    memberCount: 0,
  });

  // 新增：直播间实时数据
  const [roomStats, setRoomStats] = useState({
    audienceCount: 0, // 在线观众数
    totalUserCount: 0, // 累计观看人数
    followCount: 0, // 主播粉丝数
    likeCount: 0, // 本场点赞数
  });

  const dycastRef = useRef<DyCast | null>(null);
  const { time, formattedTime, reset } = useTimeCounter(isConnected);

  // Initialize monitor on component mount and check status
  useEffect(() => {
    // 检查监控状态而不是自动启动
    const checkMonitorStatus = () => {
      const isActive = liveRoomMonitor.isMonitoring();
      setMonitorEnabled(isActive);
    };

    checkMonitorStatus();

    // 定期检查监控状态
    const statusInterval = setInterval(checkMonitorStatus, 3000);

    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  // Handle monitor toggle
  const handleMonitorToggle = async (enabled: boolean) => {
    setMonitorEnabled(enabled);
    if (enabled) {
      await liveRoomMonitor.startMonitoring();
      toast.success("数据库监控已启动");
    } else {
      await liveRoomMonitor.stopMonitoring();
      toast.info("数据库监控已停止");
    }
  };

  // Update active rooms count periodically
  useEffect(() => {
    if (monitorEnabled) {
      const interval = setInterval(() => {
        setActiveRoomsCount(liveRoomMonitor.getActiveConnectionsCount());
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [monitorEnabled]);

  const handleConnect = async () => {
    if (!roomNum.trim()) {
      setConnectionError("请输入房间号");
      toast.error("请输入房间号");
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);
    toast.info(`正在连接房间：${roomNum}`);

    try {
      const dycast = new DyCast(roomNum);

      dycast.on("open", (ev, info) => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        setLiveInfo(info || null);

        // 初始化直播间数据（如果 info 中有的话）
        if (info) {
          setRoomStats((prev) => ({
            ...prev,
            // 这里可以从 liveInfo 中获取初始数据，如果有的话
          }));
        }

        reset();
        console.log("连接成功", info);
        toast.success(`房间连接成功[${roomNum}]`);
      });

      dycast.on("message", (msgs: DyMessage[]) => {
        console.log("收到消息:", msgs); // 添加调试日志
        setMessages((prev) => [...prev.slice(-200), ...msgs]); // 保持最新200条

        // 更新统计
        setStats((prev) => {
          const newStats = { ...prev };
          msgs.forEach((msg) => {
            console.log("消息类型:", msg.method); // 添加调试日志
            switch (msg.method) {
              case CastMethod.CHAT:
                newStats.chatCount++;
                break;
              case CastMethod.GIFT:
                newStats.giftCount++;
                break;
              case CastMethod.LIKE:
                newStats.likeCount++;
                break;
              case CastMethod.MEMBER:
                newStats.memberCount++;
                break;
            }

            // 更新直播间实时数据
            if (msg.room) {
              setRoomStats((prevRoom) => ({
                ...prevRoom,
                audienceCount: msg.room?.audienceCount
                  ? Number(msg.room.audienceCount)
                  : prevRoom.audienceCount,
                totalUserCount: msg.room?.totalUserCount
                  ? Number(msg.room.totalUserCount)
                  : prevRoom.totalUserCount,
                followCount: msg.room?.followCount
                  ? Number(msg.room.followCount)
                  : prevRoom.followCount,
                likeCount: msg.room?.likeCount
                  ? Number(msg.room.likeCount)
                  : prevRoom.likeCount,
              }));
            }
          });
          return newStats;
        });
      });

      dycast.on("close", (code, reason) => {
        setIsConnected(false);
        setIsConnecting(false);
        console.log("连接关闭", code, reason);

        // 根据不同的关闭原因显示不同的消息
        switch (code) {
          case 1000:
            toast.success("断开成功");
            break;
          case 1006:
            toast.warning("连接异常断开");
            break;
          default:
            if (reason) {
              toast.info(reason);
              setConnectionError(reason);
            } else {
              toast.info("连接已关闭");
            }
        }
      });

      dycast.on("error", (error) => {
        console.error("连接错误", error);
        setIsConnected(false);
        setIsConnecting(false);

        let errorMessage = "连接失败";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }

        setConnectionError(errorMessage);
        toast.error(`连接出错: ${errorMessage}`);
      });

      await dycast.connect();
      dycastRef.current = dycast;
    } catch (error) {
      console.error("连接失败", error);
      setIsConnecting(false);

      let errorMessage = "连接过程出错";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setConnectionError(errorMessage);
      toast.error(`连接失败: ${errorMessage}`);
    }
  };

  const handleDisconnect = () => {
    if (dycastRef.current) {
      dycastRef.current.close();
      dycastRef.current = null;
    }
    setConnectionError(null);
  };

  const clearMessages = () => {
    setMessages([]);
    // 不清空统计数据和直播间信息，只清空消息列表
  };

  const resetStats = () => {
    setStats({ chatCount: 0, giftCount: 0, likeCount: 0, memberCount: 0 });
    setRoomStats({
      audienceCount: 0,
      totalUserCount: 0,
      followCount: 0,
      likeCount: 0,
    });
    toast.info("统计数据已重置");
  };

  return (
    <div className="space-y-4">
      {/* 连接控制 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            抖音弹幕连接
            {isConnected && (
              <Badge variant="secondary">运行时间: {formattedTime}</Badge>
            )}
            {isConnecting && <Badge variant="outline">连接中...</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 数据库监控开关 */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                数据库监控
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                自动监控数据库中的直播间
              </p>
            </div>
            <MonitorSwitch
              isMonitoring={monitorEnabled}
              activeRoomsCount={activeRoomsCount}
              onToggle={handleMonitorToggle}
            />
          </div>

          <div className="flex space-x-2">
            <Input
              placeholder="请输入房间号"
              value={roomNum}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRoomNum(e.target.value)
              }
              disabled={isConnected || isConnecting}
            />
            <Button
              onClick={isConnected ? handleDisconnect : handleConnect}
              variant={isConnected ? "destructive" : "default"}
              disabled={isConnecting}
            >
              {isConnecting ? "连接中..." : isConnected ? "断开" : "连接"}
            </Button>
          </div>

          {/* 错误提示 */}
          {connectionError && (
            <Alert variant="destructive">
              <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
          )}

          {/* 连接状态提示 */}
          {!isConnected && !isConnecting && !connectionError && (
            <Alert>
              <AlertDescription>
                请输入抖音直播间房间号进行连接。
              </AlertDescription>
            </Alert>
          )}

          {liveInfo && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    房间信息
                  </p>
                  <p className="font-semibold">{liveInfo.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    主播: {liveInfo.nickname}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    房间号
                  </p>
                  <p className="font-mono text-sm">{roomNum}</p>
                </div>
              </div>

              {/* 直播间实时数据 */}
              <div className="border-t pt-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  直播间数据
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {formatNumber(roomStats.audienceCount)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      在线观众
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {formatNumber(roomStats.totalUserCount)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      累计观看
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {formatNumber(roomStats.followCount)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      主播粉丝
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {formatNumber(roomStats.likeCount)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      本场点赞
                    </div>
                  </div>
                </div>
              </div>

              {/* 消息统计 */}
              <div className="border-t pt-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  消息统计
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="px-3 py-1">
                    💬 弹幕: {stats.chatCount}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    🎁 礼物: {stats.giftCount}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    👍 点赞: {stats.likeCount}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    👋 进入: {stats.memberCount}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 弹幕展示 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>弹幕消息</CardTitle>
          <div className="flex space-x-2">
            <Button onClick={clearMessages} variant="outline" size="sm">
              清空消息
            </Button>
            <Button onClick={resetStats} variant="outline" size="sm">
              重置统计
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96 overflow-y-auto space-y-1 border rounded p-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index} className="text-sm flex items-start space-x-2">
                <Badge
                  variant={
                    msg.method === CastMethod.CHAT
                      ? "default"
                      : msg.method === CastMethod.GIFT
                      ? "destructive"
                      : msg.method === CastMethod.LIKE
                      ? "secondary"
                      : "outline"
                  }
                  className="shrink-0 text-xs"
                >
                  {msg.method === CastMethod.CHAT
                    ? "💬"
                    : msg.method === CastMethod.GIFT
                    ? "🎁"
                    : msg.method === CastMethod.LIKE
                    ? "👍"
                    : "👋"}
                </Badge>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-blue-600">
                    {msg.user?.name || "匿名"}:
                  </span>
                  <span className="ml-2 break-words">{msg.content}</span>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-gray-500 text-center">暂无弹幕消息</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
