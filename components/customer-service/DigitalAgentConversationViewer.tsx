import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  MessageSquare,
  User,
  Clock,
  Tag,
  ArrowUpRight,
  CheckCircle,
  AlertTriangle,
  Activity,
  ShoppingCart,
  History
} from 'lucide-react';
import { DigitalAgent, DigitalAgentConversation } from '../../types';

interface DigitalAgentConversationViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: DigitalAgent;
}

export function DigitalAgentConversationViewer({
  open,
  onOpenChange,
  agent
}: DigitalAgentConversationViewerProps) {
  const [selectedConversation, setSelectedConversation] = useState<DigitalAgentConversation | null>(null);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN');
  };

  const getStatusColor = (status: DigitalAgentConversation['status']) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      case 'escalated': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: DigitalAgentConversation['status']) => {
    switch (status) {
      case 'active': return '进行中';
      case 'resolved': return '已解决';
      case 'escalated': return '已升级';
      default: return '未知';
    }
  };

  const getStatusIcon = (status: DigitalAgentConversation['status']) => {
    switch (status) {
      case 'active': return <Activity className="size-3" />;
      case 'resolved': return <CheckCircle className="size-3" />;
      case 'escalated': return <ArrowUpRight className="size-3" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] overflow-hidden flex flex-col sm:max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img
              src={agent.avatar}
              alt={agent.name}
              className="size-6 rounded-full"
            />
            数字客服{agent.number} - {agent.name} 对话处理过程
            <Badge variant="secondary" className="ml-2">
              {agent.currentConversations.length} 个对话
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="conversations" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="conversations">当前对话</TabsTrigger>
              <TabsTrigger value="history">历史记录</TabsTrigger>
            </TabsList>
            
            <TabsContent value="conversations" className="flex-1 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                {/* 对话列表 */}
                <div className="lg:col-span-1">
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">对话列表</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                      <ScrollArea className="h-[700px]">
                        <div className="space-y-2">
                          {agent.currentConversations.map((conversation) => (
                            <Card 
                              key={conversation.id}
                              className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                                selectedConversation?.id === conversation.id ? 'ring-2 ring-primary' : ''
                              }`}
                              onClick={() => setSelectedConversation(conversation)}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-sm font-medium">
                                    <User className="size-3" />
                                    {conversation.customerName}
                                  </div>
                                  <Badge 
                                    variant={conversation.status === 'active' ? 'default' : 'secondary'}
                                    className="text-xs gap-1"
                                  >
                                    <div className={`size-2 rounded-full ${getStatusColor(conversation.status)}`} />
                                    {getStatusText(conversation.status)}
                                  </Badge>
                                </div>
                                
                                <div className="text-xs text-muted-foreground">
                                  {conversation.roomName}
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  {conversation.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="size-3" />
                                  {formatTime(conversation.lastUpdateTime)}
                                  {conversation.priority === 'high' && (
                                    <Badge variant="destructive" className="text-xs">
                                      高优先级
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                          
                          {agent.currentConversations.length === 0 && (
                            <div className="text-center py-8">
                              <MessageSquare className="size-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-sm text-muted-foreground">暂无进行中的对话</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                {/* 对话详情 */}
                <div className="lg:col-span-3">
                  {selectedConversation ? (
                    <div className="space-y-4 h-full flex flex-col">
                      {/* 客户信息区 */}
                      <Card className="shrink-0">
                        <CardHeader className="pb-1 py-2">
                          <CardTitle className="flex items-center gap-1 text-xs">
                            <User className="size-3" />
                            {selectedConversation.customerInfo.userName}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 pb-3 space-y-1.5">
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div className="text-center">
                              <div className="text-muted-foreground text-[10px]">来访</div>
                              <div className="font-medium">{selectedConversation.customerInfo.visitCount}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted-foreground text-[10px]">互动</div>
                              <div className="font-medium">{selectedConversation.customerInfo.interactionCount}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted-foreground text-[10px]">提问</div>
                              <div className="font-medium">{selectedConversation.customerInfo.questionCount}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-muted-foreground text-[10px]">订单</div>
                              <div className="font-medium">{selectedConversation.customerInfo.orderHistory.length}</div>
                            </div>
                          </div>

                          <div className="flex justify-between text-xs">
                            {/* 历史订单 */}
                            {selectedConversation.customerInfo.orderHistory.length > 0 && (
                              <div className="flex-1 pr-2">
                                <div className="text-muted-foreground text-[10px] mb-0.5 flex items-center gap-0.5">
                                  <ShoppingCart className="size-2.5" />
                                  最近订单
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {selectedConversation.customerInfo.orderHistory[0].productName} ¥
                                  {selectedConversation.customerInfo.orderHistory[0].amount}
                                </div>
                              </div>
                            )}

                            {/* 近期沟通摘要 */}
                            {selectedConversation.customerInfo.recentCommunications.length > 0 && (
                              <div className="flex-1 pl-2 border-l border-border">
                                <div className="text-muted-foreground text-[10px] mb-0.5 flex items-center gap-0.5">
                                  <History className="size-2.5" />
                                  近期沟通
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {selectedConversation.customerInfo.recentCommunications[0]}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* 对话区域 */}
                      <Card className="flex-1 flex flex-col">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {selectedConversation.roomName}
                              </Badge>
                              <span className="text-base">
                                {selectedConversation.customerName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={selectedConversation.status === 'active' ? 'default' : 'secondary'}
                                className="gap-1"
                              >
                                {getStatusIcon(selectedConversation.status)}
                                {getStatusText(selectedConversation.status)}
                              </Badge>
                              {selectedConversation.priority === 'high' && (
                                <Badge variant="destructive" className="gap-1">
                                  <AlertTriangle className="size-3" />
                                  高优先级
                                </Badge>
                              )}
                            </div>
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col pt-0">
                          {/* 聊天记录 */}
                          <ScrollArea className="flex-1 border rounded-lg p-3 bg-muted/20">
                            <div className="space-y-3">
                              {selectedConversation.messages.map((msg) => (
                                <div
                                  key={msg.id}
                                  className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}
                                >
                                  <div
                                    className={`rounded-lg p-2 max-w-[80%] ${
                                      msg.sender === 'customer'
                                        ? 'bg-blue-100 dark:bg-blue-900/30'
                                        : 'bg-green-100 dark:bg-green-900/30'
                                    }`}
                                  >
                                    <p className="text-sm">{msg.content}</p>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-xs text-muted-foreground">
                                        {formatTime(msg.timestamp)}
                                      </span>
                                      {msg.sender === 'agent' && (
                                        <Badge variant="outline" className="text-[10px] ml-2">
                                          AI回复
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card className="h-full">
                      <CardContent className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageSquare className="size-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            请选择一个对话查看详情
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="flex-1">
              <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <History className="size-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">历史记录</h3>
                    <p className="text-sm text-muted-foreground">
                      这里将显示数字客服的历史处理记录
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}