import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { DigitalAgentConversationViewer } from './DigitalAgentConversationViewer';
import { 
  Plus,
  Bot,
  Activity,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
  Settings,
  User,
  Eye,
  MessageSquare
} from 'lucide-react';
import { DigitalAgent } from '../../types';

interface DigitalAgentManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: DigitalAgent[];
  onAddAgent: (agent: Omit<DigitalAgent, 'id' | 'createdAt' | 'lastActiveAt'>) => void;
  onUpdateAgent: (id: string, updates: Partial<DigitalAgent>) => void;
  onDeleteAgent: (id: string) => void;
}

export function DigitalAgentManager({
  open,
  onOpenChange,
  agents,
  onAddAgent,
  onUpdateAgent,
  onDeleteAgent
}: DigitalAgentManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<DigitalAgent | null>(null);
  const [viewingAgent, setViewingAgent] = useState<DigitalAgent | null>(null);
  const [newAgent, setNewAgent] = useState({
    name: '',
    avatar: '',
    specialties: '',
    questionsHandled: 0,
    successRate: 95,
    averageResponseTime: 3
  });

  const handleAddAgent = () => {
    if (!newAgent.name.trim()) return;
    
    const nextNumber = Math.max(...agents.map(a => a.number), 0) + 1;
    
    onAddAgent({
      name: newAgent.name.trim(),
      number: nextNumber,
      avatar: newAgent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newAgent.name}`,
      status: 'online',
      specialties: newAgent.specialties.split(',').map(s => s.trim()).filter(Boolean),
      questionsHandled: newAgent.questionsHandled,
      successRate: newAgent.successRate,
      averageResponseTime: newAgent.averageResponseTime,
      currentConversations: [] // 新客服初始无对话
    });

    setNewAgent({
      name: '',
      avatar: '',
      specialties: '',
      questionsHandled: 0,
      successRate: 95,
      averageResponseTime: 3
    });
    setShowAddForm(false);
  };

  const getStatusColor = (status: DigitalAgent['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: DigitalAgent['status']) => {
    switch (status) {
      case 'online': return '在线';
      case 'busy': return '忙碌';
      case 'offline': return '离线';
      default: return '未知';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="size-5 text-blue-500" />
            数字客服分身管理
            <Badge variant="secondary" className="ml-2">
              {agents.length} 个客服
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* 操作区域 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              管理您的数字客服分身，配置专业技能和工作参数
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="gap-2"
            >
              <Plus className="size-4" />
              新增客服
            </Button>
          </div>

          {/* 客服列表 */}
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
              {agents.map((agent) => (
                <Card key={agent.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="relative">
                          <img
                            src={agent.avatar}
                            alt={agent.name}
                            className="size-8 rounded-full"
                          />
                          <div 
                            className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white ${getStatusColor(agent.status)}`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            数字客服{agent.number}
                            <Badge variant="outline" className="text-xs">
                              {agent.name}
                            </Badge>
                          </div>
                        </div>
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingAgent(agent)}
                          title="查看对话"
                        >
                          <Eye className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAgent(agent)}
                          title="编辑客服"
                        >
                          <Edit className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteAgent(agent.id)}
                          className="text-red-500 hover:text-red-600"
                          title="删除客服"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* 状态信息 */}
                    <div className="flex items-center justify-between text-xs">
                      <Badge 
                        variant={agent.status === 'online' ? 'default' : 'secondary'}
                        className="gap-1"
                      >
                        <div className={`size-2 rounded-full ${getStatusColor(agent.status)}`} />
                        {getStatusText(agent.status)}
                      </Badge>
                      <span className="text-muted-foreground">
                        上次活动: {agent.lastActiveAt.toLocaleTimeString('zh-CN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>

                    {/* 专业技能 */}
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">专业技能</div>
                      <div className="flex flex-wrap gap-1">
                        {agent.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* 当前对话状态 */}
                    <div className="mb-2">
                      <div className="text-xs text-muted-foreground mb-1">当前对话</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <MessageSquare className="size-2.5" />
                          {agent.currentConversations.length} 个对话
                        </Badge>
                        <Badge 
                          variant={agent.currentConversations.some(c => c.status === 'active') ? 'default' : 'secondary'}
                          className="gap-1"
                        >
                          {agent.currentConversations.filter(c => c.status === 'active').length} 进行中
                        </Badge>
                      </div>
                    </div>

                    {/* 性能指标 */}
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-medium">{agent.questionsHandled}</div>
                        <div className="text-muted-foreground">处理问题</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <div className="font-medium text-green-600">{agent.successRate}%</div>
                        <div className="text-muted-foreground">成功率</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <div className="font-medium text-blue-600">{agent.averageResponseTime}s</div>
                        <div className="text-muted-foreground">响应时间</div>
                      </div>
                    </div>

                    {/* 查看对话按钮 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingAgent(agent)}
                      className="w-full gap-2"
                      disabled={agent.currentConversations.length === 0}
                    >
                      <MessageSquare className="size-4" />
                      查看对话过程
                      {agent.currentConversations.length > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {agent.currentConversations.length}
                        </Badge>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              {/* 空状态 */}
              {agents.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <Bot className="size-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">暂无数字客服</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    创建您的第一个数字客服分身开始使用
                  </p>
                  <Button onClick={() => setShowAddForm(true)} className="gap-2">
                    <Plus className="size-4" />
                    新增客服
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* 新增客服表单 */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增数字客服</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="agent-name">客服名称</Label>
                <Input
                  id="agent-name"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入客服名称"
                />
              </div>
              
              <div>
                <Label htmlFor="agent-avatar">头像URL（可选）</Label>
                <Input
                  id="agent-avatar"
                  value={newAgent.avatar}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, avatar: e.target.value }))}
                  placeholder="留空将自动生成头像"
                />
              </div>
              
              <div>
                <Label htmlFor="agent-specialties">专业技能</Label>
                <Textarea
                  id="agent-specialties"
                  value={newAgent.specialties}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, specialties: e.target.value }))}
                  placeholder="用逗号分隔，如：售前咨询,产品介绍,订单处理"
                  className="min-h-[60px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agent-success-rate">成功率 (%)</Label>
                  <Input
                    id="agent-success-rate"
                    type="number"
                    min="0"
                    max="100"
                    value={newAgent.successRate}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, successRate: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="agent-response-time">响应时间 (秒)</Label>
                  <Input
                    id="agent-response-time"
                    type="number"
                    min="1"
                    value={newAgent.averageResponseTime}
                    onChange={(e) => setNewAgent(prev => ({ ...prev, averageResponseTime: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                取消
              </Button>
              <Button onClick={handleAddAgent}>
                创建客服
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 数字客服对话查看器 */}
        {viewingAgent && (
          <DigitalAgentConversationViewer
            open={!!viewingAgent}
            onOpenChange={(open) => !open && setViewingAgent(null)}
            agent={viewingAgent}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}