import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LiveRoom } from '../types';

interface RoomFilterProps {
  liveRooms: LiveRoom[];
  selectedRoomId: string;
  onRoomSelect: (roomId: string) => void;
}

export function RoomFilter({ liveRooms, selectedRoomId, onRoomSelect }: RoomFilterProps) {
  return (
    <Select value={selectedRoomId} onValueChange={onRoomSelect}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="选择直播间" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">全部直播间</SelectItem>
        {liveRooms.map((room) => (
          <SelectItem key={room.id} value={room.id}>
            {room.name} ({room.onlineCount.toLocaleString()}人)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}