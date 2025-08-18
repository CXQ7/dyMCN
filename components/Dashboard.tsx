import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Activity, MessageSquare, CheckCircle, Brain, TrendingUp, Users, UserPlus, ShoppingCart, MessageCircle, Calendar, DollarSign, Clock, Timer, BarChart3, UserCheck } from 'lucide-react';
import { RoomMetrics, TimeRange, LiveRoom } from '../types';

interface DashboardProps {
  metrics: RoomMetrics[];
  selectedRoomId: string;
  liveRooms: LiveRoom[];
  timeRange: TimeRange;
}

export function Dashboard({ metrics, selectedRoomId, liveRooms, timeRange }: DashboardProps) {

  // 根据选择的直播间过滤数据
  const isAllRooms = selectedRoomId === 'all';
  const filteredMetrics = isAllRooms ? metrics : metrics.filter(m => m.roomId === selectedRoomId);
  const currentRoom = isAllRooms ? null : liveRooms.find(r => r.id === selectedRoomId);

  // 计算指标（根据是否选择特定直播间使用不同逻辑）
  const totalPending = filteredMetrics.reduce((sum, m) => sum + m.pendingCount, 0);
  const totalAnswered = filteredMetrics.reduce((sum, m) => sum + m.answeredCount, 0);
  const totalKnowledge = filteredMetrics.reduce((sum, m) => sum + m.knowledgeCount, 0);
  const avgConversion = filteredMetrics.length > 0 ? filteredMetrics.reduce((sum, m) => sum + m.conversionRate, 0) / filteredMetrics.length : 0;
  const avgPresaleConversion = filteredMetrics.length > 0 ? filteredMetrics.reduce((sum, m) => sum + m.presaleConversionRate, 0) / filteredMetrics.length : 0;
  const avgCommentConversion = filteredMetrics.length > 0 ? filteredMetrics.reduce((sum, m) => sum + m.commentConversionRate, 0) / filteredMetrics.length : 0;
  const totalOnline = filteredMetrics.reduce((sum, m) => sum + m.onlineHistory[m.onlineHistory.length - 1], 0);
  const totalNewJoin = filteredMetrics.reduce((sum, m) => sum + m.newJoinHistory[m.newJoinHistory.length - 1], 0);
  
  // 计算成交金额指标
  const totalPresaleAmount = filteredMetrics.reduce((sum, m) => sum + m.presaleAmount, 0);
  const totalCommentAmount = filteredMetrics.reduce((sum, m) => sum + m.commentAmount, 0);
  const totalAmount = totalPresaleAmount + totalCommentAmount;

  // 计算新增指标
  const avgCommentResponseTime = filteredMetrics.length > 0 ? filteredMetrics.reduce((sum, m) => sum + m.commentResponseTime, 0) / filteredMetrics.length : 0;
  const avgPresaleResponseTime = filteredMetrics.length > 0 ? filteredMetrics.reduce((sum, m) => sum + m.presaleResponseTime, 0) / filteredMetrics.length : 0;
  const avgStayDuration = filteredMetrics.length > 0 ? filteredMetrics.reduce((sum, m) => sum + m.averageStayDuration, 0) / filteredMetrics.length : 0;
  const totalPresaleLeads = filteredMetrics.reduce((sum, m) => sum + m.presaleLeadCount, 0);

  // 准备图表数据
  const onlineChartData = Array.from({ length: 60 }, (_, i) => ({
    time: i,
    total: filteredMetrics.reduce((sum, m) => sum + (m.onlineHistory[i] || 0), 0)
  }));

  const newJoinChartData = Array.from({ length: 60 }, (_, i) => ({
    time: i,
    total: filteredMetrics.reduce((sum, m) => sum + (m.newJoinHistory[i] || 0), 0)
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5 text-blue-500" />
            {isAllRooms ? '整体指标' : `${currentRoom?.name || '直播间'} 指标`}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {/* 短文字指标：两个一行 */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <MessageSquare className="size-5 text-red-500 mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">待应答</span>
                </div>
                <div className="text-xl font-bold text-red-600">{totalPending}</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="size-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">已应答</span>
                </div>
                <div className="text-xl font-bold text-green-600">{totalAnswered}</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Brain className="size-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">知识库</span>
                </div>
                <div className="text-xl font-bold text-blue-600">{totalKnowledge}</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Users className="size-5 text-orange-500 mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">在线人数</span>
                </div>
                <div className="text-xl font-bold text-orange-600">{totalOnline.toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="size-5 text-purple-500 mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">整体转化率</span>
                </div>
                <div className="text-xl font-bold text-purple-600">{(avgConversion * 100).toFixed(1)}%</div>
              </div>

              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <UserPlus className="size-5 text-indigo-500 mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">新进人数</span>
                </div>
                <div className="text-xl font-bold text-indigo-600">{totalNewJoin}/s</div>
                <div className="text-xs text-muted-foreground mt-1">实时</div>
              </div>

              <div className="text-center p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 className="size-5 text-violet-500 mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">停留时长</span>
                </div>
                <div className="text-xl font-bold text-violet-600">{Math.round(avgStayDuration)}min</div>
                <div className="text-xs text-muted-foreground mt-1">平均</div>
              </div>

              <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <UserCheck className="size-5 text-slate-500 mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">售前引流量</span>
                </div>
                <div className="text-xl font-bold text-slate-600">{totalPresaleLeads}</div>
                <div className="text-xs text-muted-foreground mt-1">累计</div>
              </div>
            </div>
          </div>

          {/* 长文字指标：一个一行 */}
          <div className="space-y-4 mb-6">




            <div className="grid grid-cols-1 gap-4">
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="size-5 text-emerald-500 mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">总成交金额</span>
                </div>
                <div className="text-xl font-bold text-emerald-600">￥{totalAmount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">{timeRange.label}</div>
              </div>
            </div>

            {/* 详细转化分析 - 全部场景和单个场景都显示 */}
            {filteredMetrics.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/20">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <ShoppingCart className="size-4 text-teal-500" />
                    售前转化分析
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">转化率</span>
                      <Badge variant="default" className="bg-teal-100 text-teal-800 hover:bg-teal-200 dark:bg-teal-900 dark:text-teal-100">
                        {(avgPresaleConversion * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">成交金额</span>
                      <span className="font-medium">￥{totalPresaleAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">平均客单价</span>
                      <span className="font-medium">￥{totalPresaleAmount > 0 ? Math.round(totalPresaleAmount / Math.max(1, totalAnswered * avgPresaleConversion)).toLocaleString() : '0'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">引流量</span>
                      <span className="font-medium">{totalPresaleLeads}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">平均应答时间</span>
                      <span className="font-medium">{Math.round(avgPresaleResponseTime)}s</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/20">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <MessageCircle className="size-4 text-cyan-500" />
                    评论转化分析
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">转化率</span>
                      <Badge variant="default" className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-900 dark:text-cyan-100">
                        {(avgCommentConversion * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">成交金额</span>
                      <span className="font-medium">￥{totalCommentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">平均客单价</span>
                      <span className="font-medium">￥{totalCommentAmount > 0 ? Math.round(totalCommentAmount / Math.max(1, totalAnswered * avgCommentConversion)).toLocaleString() : '0'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">平均应答时间</span>
                      <span className="font-medium">{Math.round(avgCommentResponseTime)}s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{isAllRooms ? '覆盖直播间' : '当前直播间'}</span>
                      <span className="font-medium">{isAllRooms ? `${filteredMetrics.length}个` : currentRoom?.name || '直播间'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 走势图区域 - 竖直排列布局 */}
          <div className="space-y-6">
            {/* 在线人数走势图 */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Users className="size-4 text-blue-500" />
                在线人数走势（秒级）
                <Badge variant="secondary" className="text-xs">{totalOnline.toLocaleString()}</Badge>
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={onlineChartData}>
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={false} />
                    <YAxis axisLine={false} tickLine={false} tick={false} />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 转化率趋势图 */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="size-4 text-purple-500" />
                转化率趋势
                <Badge variant="secondary" className="text-xs">{(avgConversion * 100).toFixed(1)}%</Badge>
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={Array.from({ length: 60 }, (_, i) => ({
                    time: i,
                    overall: avgConversion * (0.85 + Math.random() * 0.3),
                    presale: avgPresaleConversion * (0.8 + Math.random() * 0.4),
                    comment: avgCommentConversion * (0.8 + Math.random() * 0.4)
                  }))}>
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={false} />
                    <YAxis axisLine={false} tickLine={false} tick={false} />
                    <Line 
                      type="monotone" 
                      dataKey="overall" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={false}
                      name="整体转化率"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="presale" 
                      stroke="#14b8a6" 
                      strokeWidth={2}
                      dot={false}
                      name="售前转化率"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="comment" 
                      stroke="#06b6d4" 
                      strokeWidth={2}
                      dot={false}
                      name="评论转化率"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 新进直播间人数走势图 */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <UserPlus className="size-4 text-emerald-500" />
                每秒新进{isAllRooms ? '直播间' : ''}人数走势
                <Badge variant="secondary" className="text-xs">{totalNewJoin}/s</Badge>
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={newJoinChartData}>
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={false} />
                    <YAxis axisLine={false} tickLine={false} tick={false} />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}