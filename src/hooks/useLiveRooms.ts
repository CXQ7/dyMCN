import { useState, useEffect } from "react";
import { LiveRoom } from "../../types";
import { getAllLiveRooms, getActiveLiveRooms } from "../lib/liveRoomService";
import { useOnlineCounts } from "./useOnlineCounts";

export function useLiveRooms(activeOnly: boolean = false) {
  const [liveRooms, setLiveRooms] = useState<LiveRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取实时在线人数
  const {
    getOnlineCount,
    getTotalOnlineCount,
    onlineCounts,
    loading: onlineCountLoading,
    getChartData,
    getYAxisRange,
    getPendingDataStatus,
  } = useOnlineCounts();

  const loadLiveRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      const rooms = activeOnly
        ? await getActiveLiveRooms()
        : await getAllLiveRooms();

      setLiveRooms(rooms);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取直播间数据失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveRooms();
  }, [activeOnly]);

  // 合并在线人数到直播间数据
  const liveRoomsWithOnlineCount = liveRooms.map((room) => ({
    ...room,
    onlineCount: getOnlineCount(room.id) || room.onlineCount || 0,
  }));

  const refreshLiveRooms = () => {
    loadLiveRooms();
  };

  return {
    liveRooms: liveRoomsWithOnlineCount,
    loading: loading || onlineCountLoading,
    onlineCountsLoading: onlineCountLoading,
    realTimeOnlineCounts: Object.fromEntries(onlineCounts),
    totalOnlineCount: getTotalOnlineCount(),
    getChartData,
    getYAxisRange,
    getPendingDataStatus,
    error,
    refreshLiveRooms,
  };
}
