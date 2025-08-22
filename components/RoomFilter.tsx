import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";
import { LiveRoom } from "../types";

interface RoomFilterProps {
  liveRooms: LiveRoom[];
  selectedRoomId: string;
  onRoomSelect: (roomId: string) => void;
  loading?: boolean;
  onlineCountsLoading?: boolean;
  realTimeOnlineCounts?: Record<string, number>;
}

// 获取状态标签配置
function getStatusConfig(status: LiveRoom["status"]) {
  switch (status) {
    case "active":
      return { label: "直播中", variant: "default" as const };
    case "archived":
      return { label: "已结束", variant: "secondary" as const };
    default:
      return { label: "未知", variant: "outline" as const };
  }
}

export function RoomFilter({
  liveRooms,
  selectedRoomId,
  onRoomSelect,
  loading = false,
  onlineCountsLoading = false,
  realTimeOnlineCounts = {},
}: RoomFilterProps) {
  return (
    <Select value={selectedRoomId} onValueChange={onRoomSelect}>
      <SelectTrigger className="w-[21rem]">
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="size-4 animate-spin" />}
          <SelectValue placeholder="选择直播间" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">全部直播间</SelectItem>
        {liveRooms.map((room) => {
          const statusConfig = getStatusConfig(room.status);
          return (
            <SelectItem key={room.id} value={room.id}>
              <div className="flex items-center justify-between w-full min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="truncate" title={room.name}>
                    {room.name}
                  </span>
                  <Badge
                    variant={statusConfig.variant}
                    className="text-xs shrink-0"
                    style={{ marginLeft: "auto" }}
                  >
                    {statusConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0"></div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
