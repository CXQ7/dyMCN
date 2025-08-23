import { supabase } from "@/config/supabase";
import { LiveRoom } from "@/types";

export interface LiveRoomData {
  id: number;
  platform_id: string;
  name: string;
  status: "preparing" | "living" | "ended";
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
}

// 转换数据库数据为前端LiveRoom格式
function transformLiveRoomData(dbRoom: LiveRoomData): LiveRoom {
  return {
    id: dbRoom.platform_id, // 使用platform_id作为前端的id
    name: dbRoom.name,
    onlineCount: 0, // 默认为0，后续通过websocket更新
    status: dbRoom.status === "living" ? "active" : "archived",
  };
}

// 截断直播间名称，避免过长
function truncateRoomName(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) {
    return name;
  }
  return name.substring(0, maxLength - 3) + "...";
}

// 获取所有直播间
export async function getAllLiveRooms(): Promise<LiveRoom[]> {
  try {
    const { data, error } = await supabase
      .from("live_rooms")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("获取直播间列表失败:", error);
      return [];
    }

    return (data as LiveRoomData[]).map((room) => ({
      ...transformLiveRoomData(room),
      name: truncateRoomName(room.name),
    }));
  } catch (error) {
    console.error("获取直播间列表异常:", error);
    return [];
  }
}

// 获取活跃直播间
export async function getActiveLiveRooms(): Promise<LiveRoom[]> {
  try {
    const { data, error } = await supabase
      .from("live_rooms")
      .select("*")
      .eq("status", "living")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("获取活跃直播间失败:", error);
      return [];
    }

    return (data as LiveRoomData[]).map((room) => ({
      ...transformLiveRoomData(room),
      name: truncateRoomName(room.name),
    }));
  } catch (error) {
    console.error("获取活跃直播间异常:", error);
    return [];
  }
}

// 根据ID获取直播间
export async function getLiveRoomById(
  platformId: string
): Promise<LiveRoom | null> {
  try {
    const { data, error } = await supabase
      .from("live_rooms")
      .select("*")
      .eq("platform_id", platformId)
      .single();

    if (error) {
      console.error("获取直播间详情失败:", error);
      return null;
    }

    return {
      ...transformLiveRoomData(data as LiveRoomData),
      name: truncateRoomName(data.name),
    };
  } catch (error) {
    console.error("获取直播间详情异常:", error);
    return null;
  }
}

// 创建新直播间
export async function createLiveRoom(roomData: {
  platform_id: string;
  name: string;
  status?: "preparing" | "living" | "ended";
}): Promise<LiveRoom | null> {
  try {
    const { data, error } = await supabase
      .from("live_rooms")
      .insert({
        platform_id: roomData.platform_id,
        name: roomData.name,
        status: roomData.status || "preparing",
      })
      .select()
      .single();

    if (error) {
      console.error("创建直播间失败:", error);
      return null;
    }

    return {
      ...transformLiveRoomData(data as LiveRoomData),
      name: truncateRoomName(data.name),
    };
  } catch (error) {
    console.error("创建直播间异常:", error);
    return null;
  }
}

// 更新直播间状态
export async function updateLiveRoomStatus(
  platformId: string,
  status: "preparing" | "living" | "ended"
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("live_rooms")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("platform_id", platformId);

    if (error) {
      console.error("更新直播间状态失败:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("更新直播间状态异常:", error);
    return false;
  }
}

// 删除直播间
export async function deleteLiveRoom(platformId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("live_rooms")
      .delete()
      .eq("platform_id", platformId);

    if (error) {
      console.error("删除直播间失败:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("删除直播间异常:", error);
    return false;
  }
}
