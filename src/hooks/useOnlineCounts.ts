import { useState, useEffect, useRef } from "react";
import { liveRoomMonitor } from "../dycast/services/liveRoomMonitor";

interface OnlineCountHistory {
  time: number;
  count: number;
}

interface RoomHistory {
  [roomId: string]: OnlineCountHistory[];
}

interface TimeSlot {
  slotTime: number;
  count: number;
}

interface PendingDataPoint {
  roomId: string;
  count: number;
  timestamp: number;
  originalCount: number; // 记录原始的前一个数值
}

export function useOnlineCounts() {
  const [onlineCounts, setOnlineCounts] = useState<Map<string, number>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [onlineHistory, setOnlineHistory] = useState<RoomHistory>({});
  const [totalHistory, setTotalHistory] = useState<OnlineCountHistory[]>([]);
  const [timeSlots, setTimeSlots] = useState<Map<string, TimeSlot[]>>(
    new Map()
  ); // 新增：固定时间槽
  const [totalTimeSlots, setTotalTimeSlots] = useState<TimeSlot[]>([]); // 新增：总的时间槽
  const [pendingData, setPendingData] = useState<Map<string, PendingDataPoint>>(
    new Map()
  ); // 待验证的数据
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 初始化时获取当前的在线人数
    const currentCounts = liveRoomMonitor.getAllOnlineCounts();
    setOnlineCounts(new Map(currentCounts));

    // 如果监控已经激活但没有数据，可能还在加载中
    if (liveRoomMonitor.isActive() && currentCounts.size === 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }

    // 更新时间槽的函数
    const updateTimeSlots = (roomId: string, count: number) => {
      const now = Date.now();
      const currentSlot = Math.floor(now / 1000) * 1000; // 向下取整到秒

      setTimeSlots((prev) => {
        const newSlots = new Map(prev);
        const roomSlots = newSlots.get(roomId) || [];

        // 找到或创建当前时间槽
        let existingSlotIndex = roomSlots.findIndex(
          (slot) => slot.slotTime === currentSlot
        );

        if (existingSlotIndex >= 0) {
          // 更新现有时间槽
          roomSlots[existingSlotIndex] = { slotTime: currentSlot, count };
        } else {
          // 创建新时间槽
          roomSlots.push({ slotTime: currentSlot, count });
        }

        // 保持最近30秒的时间槽
        const thirtySecondsAgo = now - 30 * 1000;
        const filteredSlots = roomSlots.filter(
          (slot) => slot.slotTime >= thirtySecondsAgo
        );

        newSlots.set(roomId, filteredSlots);
        return newSlots;
      });
    };

    // 更新总时间槽
    const updateTotalTimeSlots = (allCounts: Map<string, number>) => {
      const now = Date.now();
      const currentSlot = Math.floor(now / 1000) * 1000; // 向下取整到秒
      const total = Array.from(allCounts.values()).reduce(
        (sum, count) => sum + count,
        0
      );

      setTotalTimeSlots((prev) => {
        const newSlots = [...prev];

        // 找到或创建当前时间槽
        let existingSlotIndex = newSlots.findIndex(
          (slot) => slot.slotTime === currentSlot
        );

        if (existingSlotIndex >= 0) {
          // 更新现有时间槽
          newSlots[existingSlotIndex] = { slotTime: currentSlot, count: total };
        } else {
          // 创建新时间槽
          newSlots.push({ slotTime: currentSlot, count: total });
        }

        // 保持最近30秒的时间槽
        const thirtySecondsAgo = now - 30 * 1000;
        return newSlots.filter((slot) => slot.slotTime >= thirtySecondsAgo);
      });
    };

    // 添加历史记录的函数
    const addToHistory = (roomId: string, count: number) => {
      const now = Date.now();
      updateTimeSlots(roomId, count); // 同时更新时间槽

      setOnlineHistory((prev) => {
        const newHistory = { ...prev };
        if (!newHistory[roomId]) {
          newHistory[roomId] = [];
        }

        // 添加新的数据点
        newHistory[roomId].push({ time: now, count });

        // 保持最近30秒的数据
        const thirtySecondsAgo = now - 30 * 1000;
        newHistory[roomId] = newHistory[roomId].filter(
          (item) => item.time >= thirtySecondsAgo
        );

        return newHistory;
      });
    };

    // 更新总在线人数历史
    const updateTotalHistory = (allCounts: Map<string, number>) => {
      const now = Date.now();
      const total = Array.from(allCounts.values()).reduce(
        (sum, count) => sum + count,
        0
      );

      updateTotalTimeSlots(allCounts); // 同时更新时间槽

      setTotalHistory((prev) => {
        const newHistory = [...prev];
        newHistory.push({ time: now, count: total });

        // 保持最近30秒的数据
        const thirtySecondsAgo = now - 30 * 1000;
        return newHistory.filter((item) => item.time >= thirtySecondsAgo);
      });
    };

    // 数据验证和平滑函数
    const validateAndUpdateCount = (roomId: string, newCount: number) => {
      const currentCount = onlineCounts.get(roomId) || 0;
      const now = Date.now();

      // 如果没有当前数据，直接使用新数据
      if (currentCount === 0) {
        return newCount;
      }

      // 计算变化百分比
      const changePercentage = Math.abs(newCount - currentCount) / currentCount;

      // 如果变化超过60%且新数据更小，则进入延时验证
      if (changePercentage > 0.6 && newCount < currentCount) {
        console.log(
          `[数据验证] ${roomId}: 检测到异常变化 ${currentCount} -> ${newCount} (${(
            changePercentage * 100
          ).toFixed(1)}%)`
        );

        // 检查是否已有待验证数据
        const existing = pendingData.get(roomId);

        if (existing) {
          // 检查是否已经等待了3秒
          if (now - existing.timestamp >= 3000) {
            console.log(
              `[数据验证] ${roomId}: 3秒延时结束，应用低数值 ${newCount}`
            );
            // 清除待验证数据并使用新数据
            setPendingData((prev) => {
              const newMap = new Map(prev);
              newMap.delete(roomId);
              return newMap;
            });
            return newCount;
          } else {
            // 继续等待，使用原始数据
            console.log(
              `[数据验证] ${roomId}: 继续等待验证，使用原数据 ${existing.originalCount}`
            );
            return existing.originalCount;
          }
        } else {
          // 创建新的待验证数据
          setPendingData((prev) => {
            const newMap = new Map(prev);
            newMap.set(roomId, {
              roomId,
              count: newCount,
              timestamp: now,
              originalCount: currentCount,
            });
            return newMap;
          });
          console.log(
            `[数据验证] ${roomId}: 开始3秒延时验证，暂用原数据 ${currentCount}`
          );
          return currentCount;
        }
      } else {
        // 变化正常，清除可能存在的待验证数据
        setPendingData((prev) => {
          const newMap = new Map(prev);
          newMap.delete(roomId);
          return newMap;
        });
        return newCount;
      }
    };

    // 清理过期的待验证数据
    const cleanupPendingData = () => {
      const now = Date.now();
      setPendingData((prev) => {
        const newMap = new Map(prev);
        for (const [roomId, data] of newMap.entries()) {
          if (now - data.timestamp >= 3000) {
            console.log(`[数据验证] ${roomId}: 清理过期待验证数据`);
            newMap.delete(roomId);
          }
        }
        return newMap;
      });
    };

    // 订阅在线人数更新
    const unsubscribe = liveRoomMonitor.subscribeToOnlineCount(
      (roomId, count) => {
        console.log(
          `[useOnlineCounts] 收到在线人数更新: ${roomId} -> ${count}`
        );

        // 验证和平滑数据
        const validatedCount = validateAndUpdateCount(roomId, count);

        setOnlineCounts((prev) => {
          const newCounts = new Map(prev);
          newCounts.set(roomId, validatedCount);

          // 添加到历史记录
          addToHistory(roomId, validatedCount);
          updateTotalHistory(newCounts);

          return newCounts;
        });

        setLoading(false);
      }
    );

    // 定期记录当前在线人数（每秒一次）
    intervalRef.current = setInterval(() => {
      const currentCounts = liveRoomMonitor.getAllOnlineCounts();
      if (currentCounts.size > 0) {
        // 验证并更新每个直播间的在线人数
        const validatedCounts = new Map<string, number>();

        currentCounts.forEach((count, roomId) => {
          const validatedCount = validateAndUpdateCount(roomId, count);
          validatedCounts.set(roomId, validatedCount);
        });

        // 更新状态中的在线人数
        setOnlineCounts(validatedCounts);

        // 记录每个直播间的历史
        validatedCounts.forEach((count, roomId) => {
          addToHistory(roomId, count);
        });

        // 更新总在线人数历史
        updateTotalHistory(validatedCounts);

        // 清理过期的待验证数据
        cleanupPendingData();

        console.log("Interval update:", {
          counts: Array.from(validatedCounts.entries()),
          total: Array.from(validatedCounts.values()).reduce(
            (sum, count) => sum + count,
            0
          ),
        });
      }
    }, 1000);

    // 监听监控状态变化
    const checkMonitorStatus = () => {
      if (!liveRoomMonitor.isActive()) {
        setLoading(false);
        setOnlineCounts(new Map());
      }
    };

    // 定期检查监控状态
    const statusCheckInterval = setInterval(checkMonitorStatus, 1000);

    return () => {
      unsubscribe();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearInterval(statusCheckInterval);
    };
  }, []);

  const getOnlineCount = (roomId: string): number | undefined => {
    return onlineCounts.get(roomId);
  };

  const getTotalOnlineCount = (): number => {
    return Array.from(onlineCounts.values()).reduce(
      (sum, count) => sum + count,
      0
    );
  };

  const getRoomHistory = (roomId: string): OnlineCountHistory[] => {
    return onlineHistory[roomId] || [];
  };

  const getTotalHistory = (): OnlineCountHistory[] => {
    return totalHistory;
  };

  // 获取图表显示用的数据（30个数据点，每秒一个）
  const getChartData = (roomId?: string) => {
    const now = Date.now();
    const data = [];

    // 使用时间槽数据而不是历史数据
    const slots = roomId ? timeSlots.get(roomId) || [] : totalTimeSlots;
    const currentCount = roomId
      ? onlineCounts.get(roomId) || 0
      : Array.from(onlineCounts.values()).reduce(
          (sum, count) => sum + count,
          0
        );

    console.log("getChartData called:", {
      roomId,
      slotsLength: slots.length,
      currentCount,
      isMonitorActive: liveRoomMonitor.isActive(),
      recentSlots: slots.slice(-3),
    });

    // 生成30个固定的时间槽（每秒一个）
    for (let i = 0; i < 30; i++) {
      const slotTime = Math.floor((now - (29 - i) * 1000) / 1000) * 1000;

      // 查找对应的时间槽
      const matchingSlot = slots.find((slot) => slot.slotTime === slotTime);

      let count = 0;
      if (matchingSlot) {
        count = matchingSlot.count;
      } else if (i === 29) {
        // 如果是最新的时间点且没有找到槽，使用当前在线人数
        count = currentCount;
      } else {
        // 查找最近的有效时间槽
        const previousSlots = slots.filter((slot) => slot.slotTime <= slotTime);
        if (previousSlots.length > 0) {
          const latestSlot = previousSlots[previousSlots.length - 1];
          count = latestSlot.count;
        }
      }

      data.push({
        time: i,
        count: count,
        label: `${29 - i}s前`,
      });
    }

    console.log("Generated chart data sample:", {
      currentCount,
      dataLength: data.length,
      sampleData: data
        .slice(-5)
        .map((d) => ({ time: d.time, count: d.count, label: d.label })),
    });

    return data;
  };

  // 计算Y轴的合适范围
  const getYAxisRange = (data: { count: number }[]) => {
    if (data.length === 0) return { min: 0, max: 100 };

    const counts = data.map((d) => d.count);
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    const range = max - min;

    // 如果所有数据都是0，显示0-100的范围
    if (max === 0) {
      return { min: 0, max: 100 };
    }

    // 如果范围太小（小于最大值的20%），扩展范围
    const minRange = Math.max(10, max * 0.2);
    if (range < minRange) {
      const center = (min + max) / 2;
      const halfRange = minRange / 2;
      return {
        min: Math.max(0, Math.floor(center - halfRange)),
        max: Math.ceil(center + halfRange),
      };
    }

    // 在实际范围基础上增加20%的边距，确保曲线清晰可见
    const margin = Math.max(range * 0.2, 5);
    return {
      min: Math.max(0, Math.floor(min - margin)),
      max: Math.ceil(max + margin),
    };
  };

  // 获取待验证数据的状态
  const getPendingDataStatus = () => {
    const result: Record<
      string,
      { isWaiting: boolean; waitingTime: number; originalCount: number }
    > = {};
    const now = Date.now();

    pendingData.forEach((data, roomId) => {
      result[roomId] = {
        isWaiting: true,
        waitingTime: now - data.timestamp,
        originalCount: data.originalCount,
      };
    });

    return result;
  };

  return {
    onlineCounts,
    loading,
    getOnlineCount,
    getTotalOnlineCount,
    getRoomHistory,
    getTotalHistory,
    getChartData,
    getYAxisRange,
    getPendingDataStatus,
    isMonitorActive: liveRoomMonitor.isActive(),
  };
}
