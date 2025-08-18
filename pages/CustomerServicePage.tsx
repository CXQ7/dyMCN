import { useState } from 'react';
import { ServiceQuestionList } from '../components/customer-service/ServiceQuestionList';
import { ChatWorkspace } from '../components/customer-service/ChatWorkspace';
import { AIAssistant } from '../components/customer-service/AIAssistant';
import { DigitalAgentManager } from '../components/customer-service/DigitalAgentManager';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Bot, Eye } from 'lucide-react';
import { 
  ServiceQuestion,
  CustomerInfo,
  ChatMessage,
  AIAssistSuggestion,
  QACandidate,
  SystemSettings,
  DigitalAgent,
  DigitalAgentConversation
} from '../types';
import {
  generateServiceQuestions,
  generateCustomerInfo,
  generateAIAssistSuggestions,
  generateChatMessages,
  generateQACandidates,
  generateDigitalAgents
} from '../utils/mockData';

interface CustomerServicePageProps {
  systemSettings: SystemSettings;
  onSystemSettingsChange: (settings: SystemSettings) => void;
}

export function CustomerServicePage({ 
  systemSettings, 
  onSystemSettingsChange 
}: CustomerServicePageProps) {
  const [serviceQuestions] = useState(generateServiceQuestions(20));
  const [selectedQuestion, setSelectedQuestion] = useState<ServiceQuestion | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [aiSuggestions, setAISuggestions] = useState<AIAssistSuggestion[]>([]);
  const [qaCandidates, setQACandidates] = useState(generateQACandidates(12));
  const [digitalAgents, setDigitalAgents] = useState(generateDigitalAgents(systemSettings.digitalAgentCount));
  const [showDigitalAgentManager, setShowDigitalAgentManager] = useState(false);

  const handleQuestionSelect = (question: ServiceQuestion) => {
    setSelectedQuestion(question);
    setCustomerInfo(generateCustomerInfo(question.userName));
    setChatMessages(generateChatMessages(5));
    setAISuggestions(generateAIAssistSuggestions(question.id, 3));
  };

  const handleServiceModeChange = (mode: 'auto' | 'manual') => {
    onSystemSettingsChange({
      ...systemSettings,
      serviceMode: mode
    });
  };

  const handleSendMessage = (content: string, type: 'text' | 'image' | 'video' | 'link') => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'agent',
      content,
      type,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleAdoptSuggestion = (suggestion: AIAssistSuggestion) => {
    handleSendMessage(suggestion.suggestedAnswer, 'text');
  };

  const handleEditSuggestion = (suggestion: AIAssistSuggestion, editedContent: string) => {
    handleSendMessage(editedContent, 'text');
  };

  const handleQAAction = (id: string, action: 'approve' | 'reject') => {
    setQACandidates(prev => 
      prev.map(candidate => 
        candidate.id === id 
          ? { ...candidate, status: action === 'approve' ? 'approved' : 'rejected' }
          : candidate
      )
    );
  };

  const handleQAEdit = (id: string) => {
    console.log('Edit QA candidate:', id);
    // 实际应用中这里会打开编辑对话框
  };

  const handleAddDigitalAgent = (agent: Omit<DigitalAgent, 'id' | 'createdAt' | 'lastActiveAt'>) => {
    const newAgent: DigitalAgent = {
      ...agent,
      id: `agent-${Date.now()}`,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      currentConversations: agent.currentConversations || []
    };
    setDigitalAgents(prev => [...prev, newAgent]);
  };

  const handleUpdateDigitalAgent = (id: string, updates: Partial<DigitalAgent>) => {
    setDigitalAgents(prev => 
      prev.map(agent => 
        agent.id === id 
          ? { ...agent, ...updates, lastActiveAt: new Date() }
          : agent
      )
    );
  };

  const handleDeleteDigitalAgent = (id: string) => {
    setDigitalAgents(prev => prev.filter(agent => agent.id !== id));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">客服坐席工作台</h2>
              <p className="text-sm text-muted-foreground">
                人工智能辅助的客户服务平台 - 当前模式：
                <span className="font-medium ml-1">
                  {systemSettings.serviceMode === 'manual' ? '有人模式' : '无人模式'}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* 数字客服状态显示 */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Bot className="size-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">数字客服:</span>
                  <Badge variant="outline" className="gap-1">
                    {digitalAgents.filter(a => a.status === 'online').length} 在线
                  </Badge>
                  <Badge variant="secondary">
                    总计 {digitalAgents.length}
                  </Badge>
                </div>
              </div>
              
              {/* 查看数字客服按钮 */}
              <Button
                variant="outline"
                onClick={() => setShowDigitalAgentManager(true)}
                className="gap-2"
              >
                <Eye className="size-4" />
                查看数字客服
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[calc(100vh-200px)]">
          {/* a区：机器推荐问题列表 */}
          <div className="lg:col-span-1 relative">
            <ServiceQuestionList
              questions={serviceQuestions}
              selectedQuestionId={selectedQuestion?.id || null}
              serviceMode={systemSettings.serviceMode}
              onQuestionSelect={handleQuestionSelect}
              onServiceModeChange={handleServiceModeChange}
            />
          </div>

          {/* b区：坐席对话工作台 */}
          <div className="lg:col-span-2 relative">
            <ChatWorkspace
              selectedQuestion={selectedQuestion}
              customerInfo={customerInfo}
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
            />
          </div>

          {/* c区：AI智能助手 (合并了信息提示助手和结构化知识挖掘) */}
          <div className="lg:col-span-1 relative">
            <AIAssistant
              selectedQuestion={selectedQuestion}
              suggestions={aiSuggestions}
              qaCandidates={qaCandidates}
              onAdoptSuggestion={handleAdoptSuggestion}
              onEditSuggestion={handleEditSuggestion}
              onQAAction={handleQAAction}
              onQAEdit={handleQAEdit}
            />
          </div>
        </div>
        
        {/* 数字客服管理弹窗 */}
        <DigitalAgentManager
          open={showDigitalAgentManager}
          onOpenChange={setShowDigitalAgentManager}
          agents={digitalAgents}
          onAddAgent={handleAddDigitalAgent}
          onUpdateAgent={handleUpdateDigitalAgent}
          onDeleteAgent={handleDeleteDigitalAgent}
        />
      </div>
    </div>
  );
}