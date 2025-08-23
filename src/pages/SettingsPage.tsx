import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Shield, 
  Settings, 
  Bot, 
  Webhook,
  Plus,
  X,
  Save,
  RotateCcw,
  Minus
} from 'lucide-react';
import { FilterSettings, SystemSettings } from '../types';
import { generateFilterSettings } from '../utils/mockData';

interface SettingsPageProps {
  systemSettings: SystemSettings;
  onSystemSettingsChange: (settings: SystemSettings) => void;
}

export function SettingsPage({ systemSettings, onSystemSettingsChange }: SettingsPageProps) {
  const [filterSettings, setFilterSettings] = useState<FilterSettings>(generateFilterSettings());
  const [newBlockedUser, setNewBlockedUser] = useState('');
  const [newBlockedKeyword, setNewBlockedKeyword] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSystemSettingChange = (key: keyof SystemSettings, value: any) => {
    const newSettings = { ...systemSettings, [key]: value };
    onSystemSettingsChange(newSettings);
    setHasUnsavedChanges(true);
  };

  const handleAddBlockedUser = () => {
    if (newBlockedUser.trim()) {
      setFilterSettings(prev => ({
        ...prev,
        blockedUsers: [...prev.blockedUsers, newBlockedUser.trim()]
      }));
      setNewBlockedUser('');
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveBlockedUser = (user: string) => {
    setFilterSettings(prev => ({
      ...prev,
      blockedUsers: prev.blockedUsers.filter(u => u !== user)
    }));
    setHasUnsavedChanges(true);
  };

  const handleAddBlockedKeyword = () => {
    if (newBlockedKeyword.trim()) {
      setFilterSettings(prev => ({
        ...prev,
        blockedKeywords: [...prev.blockedKeywords, newBlockedKeyword.trim()]
      }));
      setNewBlockedKeyword('');
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveBlockedKeyword = (keyword: string) => {
    setFilterSettings(prev => ({
      ...prev,
      blockedKeywords: prev.blockedKeywords.filter(k => k !== keyword)
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = () => {
    // 这里实际应用中会调用API保存设置
    console.log('Saving settings:', { systemSettings, filterSettings });
    setHasUnsavedChanges(false);
  };

  const handleResetSettings = () => {
    // 重置为默认设置
    setFilterSettings(generateFilterSettings());
    onSystemSettingsChange({
      serviceMode: 'manual',
      aiAggressiveness: 'neutral',
      orderCallbackUrl: '',
      enableKnowledgeFeedback: true,
      digitalAgentCount: 2
    });
    setHasUnsavedChanges(false);
  };

  const handleDigitalAgentCountChange = (increment: boolean) => {
    const currentCount = systemSettings.digitalAgentCount;
    let newCount;
    
    if (increment) {
      newCount = Math.min(currentCount + 1, 10); // 最大10个
    } else {
      newCount = Math.max(currentCount - 1, 1); // 最小1个
    }
    
    handleSystemSettingChange('digitalAgentCount', newCount);
  };

  const getAggressivenessLabel = (level: string) => {
    switch (level) {
      case 'passive':
        return '消极 - 能不回答就不回答';
      case 'neutral':
        return '中性 - 能回答的才回答';
      case 'aggressive':
        return '积极 - 尽量尝试回答';
      default:
        return level;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">系统设置</h2>
            <p className="text-sm text-muted-foreground">配置系统参数和运营策略</p>
          </div>
          
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="destructive">有未保存的更改</Badge>
            )}
            <Button variant="outline" onClick={handleResetSettings} className="gap-2">
              <RotateCcw className="size-4" />
              重置
            </Button>
            <Button onClick={handleSaveSettings} className="gap-2">
              <Save className="size-4" />
              保存设置
            </Button>
          </div>
        </div>

        <Tabs defaultValue="service" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="service" className="gap-2">
              <Bot className="size-4" />
              服务配置
            </TabsTrigger>
            <TabsTrigger value="filter" className="gap-2">
              <Shield className="size-4" />
              过滤设置
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Webhook className="size-4" />
              接口配置
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Settings className="size-4" />
              高级设置
            </TabsTrigger>
          </TabsList>

          <TabsContent value="service">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>客服模式配置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <label className="font-medium">服务模式</label>
                      <p className="text-sm text-muted-foreground">
                        选择自动化服务还是人工服务模式
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">无人模式</span>
                      <Switch
                        checked={systemSettings.serviceMode === 'manual'}
                        onCheckedChange={(checked) => 
                          handleSystemSettingChange('serviceMode', checked ? 'manual' : 'auto')
                        }
                      />
                      <span className="text-sm">有人模式</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="font-medium">AI接待主动性</label>
                    <Select
                      value={systemSettings.aiAggressiveness}
                      onValueChange={(value) => handleSystemSettingChange('aiAggressiveness', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passive">
                          消极 - 能不回答就不回答
                        </SelectItem>
                        <SelectItem value="neutral">
                          中性 - 能回答的才回答（推荐）
                        </SelectItem>
                        <SelectItem value="aggressive">
                          积极 - 尽量尝试回答
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      当��选择：{getAggressivenessLabel(systemSettings.aiAggressiveness)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <label className="font-medium">运营看板：切换"成交关联" 为 "Q&A 知识库挖掘"</label>
                      <p className="text-sm text-muted-foreground">
                        支持替换看板页面的下单反馈为结构化知识挖掘加分反馈列表（当未配置订单反馈接口时，可开启，避免"运营看板"页面有整列空栏）
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.enableKnowledgeFeedback}
                      onCheckedChange={(checked) => 
                        handleSystemSettingChange('enableKnowledgeFeedback', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <label className="font-medium">数字客服数量</label>
                      <p className="text-sm text-muted-foreground">
                        设置可选择的数字客服代理数量（1-10个）
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDigitalAgentCountChange(false)}
                        disabled={systemSettings.digitalAgentCount <= 1}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="size-4" />
                      </Button>
                      <div className="flex items-center justify-center w-12 h-8 border rounded text-center text-sm font-medium">
                        {systemSettings.digitalAgentCount}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDigitalAgentCountChange(true)}
                        disabled={systemSettings.digitalAgentCount >= 10}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="filter">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>用户过滤名单</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    屏蔽指定用户（如运营水军账号）的问题和互动
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="输入用户名..."
                      value={newBlockedUser}
                      onChange={(e) => setNewBlockedUser(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddBlockedUser();
                        }
                      }}
                    />
                    <Button onClick={handleAddBlockedUser}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {filterSettings.blockedUsers.map((user) => (
                      <Badge key={user} variant="secondary" className="gap-1">
                        {user}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBlockedUser(user)}
                          className="h-auto p-0 hover:bg-transparent"
                        >
                          <X className="size-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>关键词过滤</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    自动过滤包含指定关键词的问题和评论
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="输入敏感关键词..."
                      value={newBlockedKeyword}
                      onChange={(e) => setNewBlockedKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddBlockedKeyword();
                        }
                      }}
                    />
                    <Button onClick={handleAddBlockedKeyword}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {filterSettings.blockedKeywords.map((keyword) => (
                      <Badge key={keyword} variant="destructive" className="gap-1">
                        {keyword}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBlockedKeyword(keyword)}
                          className="h-auto p-0 hover:bg-transparent text-white"
                        >
                          <X className="size-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>订单回调接口</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    配置成交数据回调接口，用于获取实时订单信息
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">回调URL</label>
                    <Input
                      placeholder="https://api.example.com/orders/callback"
                      value={systemSettings.orderCallbackUrl}
                      onChange={(e) => handleSystemSettingChange('orderCallbackUrl', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">请求示例</label>
                    <Textarea
                      readOnly
                      className="font-mono text-xs"
                      value={`POST ${systemSettings.orderCallbackUrl || 'YOUR_CALLBACK_URL'}
Content-Type: application/json

{
  "orderId": "order_123456",
  "userId": "user_789",
  "userName": "张三",
  "roomId": "room_1",
  "roomName": "美妆直播间",
  "amount": 299.99,
  "productName": "美白面膜套装",
  "orderTime": "2025-01-07T10:30:00Z",
  "status": "completed"
}`}
                      rows={12}
                    />
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    测试连接
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>高级功能配置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <label className="font-medium">数据保留期限</label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7天</SelectItem>
                        <SelectItem value="30">30天</SelectItem>
                        <SelectItem value="90">90天</SelectItem>
                        <SelectItem value="365">1年</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="font-medium">AI模型配置</label>
                    <Select defaultValue="balanced">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="speed">速度优先</SelectItem>
                        <SelectItem value="quality">效果优先</SelectItem>
                        <SelectItem value="balanced">速度和效果平衡（推荐）</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      速度优先：快速响应，适合高频问答；效果优先：深度理解，适合复杂咨询
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <label className="font-medium">启用日志记录</label>
                      <p className="text-sm text-muted-foreground">
                        记录详细的操作日志用于审计和分析
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <label className="font-medium">启用实时通知</label>
                      <p className="text-sm text-muted-foreground">
                        高优问题和异常情况的实时通知
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>数据导出</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline">导出用户问题数据</Button>
                    <Button variant="outline">导出知识库数据</Button>
                    <Button variant="outline">导出成交数据</Button>
                    <Button variant="outline">导出操作日志</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}