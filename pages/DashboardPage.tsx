import { useState } from 'react';
import { PendingQuestions } from '../components/PendingQuestions';
import { AnsweredHistory } from '../components/AnsweredHistory';
import { TransactionRelation } from '../components/TransactionRelation';
import { Dashboard } from '../components/Dashboard';
import { RoomFilter } from '../components/RoomFilter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Calendar } from 'lucide-react';
import { 
  PendingQuestion,
  AnsweredQuestion,
  Transaction,
  RoomMetrics,
  LiveRoom,
  TimeRange
} from '../types';

interface DashboardPageProps {
  pendingQuestions: PendingQuestion[];
  answeredQuestions: AnsweredQuestion[];
  transactions: Transaction[];
  roomMetrics: RoomMetrics[];
  liveRooms: LiveRoom[];
}

export function DashboardPage({
  pendingQuestions,
  answeredQuestions,
  transactions,
  roomMetrics,
  liveRooms
}: DashboardPageProps) {
  const [selectedRoomId, setSelectedRoomId] = useState('all');
  
  // 时间范围选择
  const timeRanges: TimeRange[] = [
    { label: '今日', value: 'today', days: 1 },
    { label: '近7天', value: '7days', days: 7 },
    { label: '近30天', value: '30days', days: 30 },
    { label: '近90天', value: '90days', days: 90 }
  ];
  
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('today');
  const currentTimeRange = timeRanges.find(t => t.value === selectedTimeRange) || timeRanges[0];

  return (
    <div className="p-4 space-y-4">
      <div className="max-w-[1600px] mx-auto">
        {/* 筛选区 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">运营数据看板</h2>
            <p className="text-sm text-muted-foreground">实时监控直播间互动数据和运营效果</p>
          </div>
          <div className="flex items-center gap-4">
            {/* 时间范围选择器 */}
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* 直播间选择器 */}
            <RoomFilter 
              liveRooms={liveRooms}
              selectedRoomId={selectedRoomId}
              onRoomSelect={setSelectedRoomId}
            />
          </div>
        </div>

        {/* 主要布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-[calc(100vh-180px)]">
          {/* A区域：待应答问题 */}
          <div className="lg:col-span-1 h-full">
            <PendingQuestions
              questions={pendingQuestions}
              liveRooms={liveRooms}
              selectedRoomId={selectedRoomId}
              onRoomSelect={setSelectedRoomId}
            />
          </div>

          {/* B区域：已应答历史 */}
          <div className="lg:col-span-1 h-full">
            <AnsweredHistory
              questions={answeredQuestions}
              liveRooms={liveRooms}
              selectedRoomId={selectedRoomId}
            />
          </div>

          {/* C区域：成交关联 */}
          <div className="lg:col-span-1 h-full">
            <TransactionRelation transactions={transactions} />
          </div>

          {/* D区域：数据看板 */}
          <div className="lg:col-span-3 xl:col-span-1 h-full overflow-y-auto">
            <Dashboard 
              metrics={roomMetrics} 
              selectedRoomId={selectedRoomId}
              liveRooms={liveRooms}
              timeRange={currentTimeRange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}