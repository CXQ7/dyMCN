import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { 
  Bot, 
  Edit, 
  Check, 
  Brain,
  Lightbulb,
  History,
  Database,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { AIAssistSuggestion, ServiceQuestion, QACandidate } from '../../types';

interface AIAssistantProps {
  selectedQuestion: ServiceQuestion | null;
  suggestions: AIAssistSuggestion[];
  qaCandidates: QACandidate[];
  onAdoptSuggestion: (suggestion: AIAssistSuggestion) => void;
  onEditSuggestion: (suggestion: AIAssistSuggestion, editedContent: string) => void;
  onQAAction: (id: string, action: 'approve' | 'reject') => void;
  onQAEdit: (id: string) => void;
}

export function AIAssistant({ 
  selectedQuestion, 
  suggestions, 
  qaCandidates,
  onAdoptSuggestion,
  onEditSuggestion,
  onQAAction,
  onQAEdit
}: AIAssistantProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  
  const pendingCandidates = qaCandidates.filter(candidate => candidate.status === 'pending');

  const handleStartEdit = (suggestion: AIAssistSuggestion) => {
    setEditingId(suggestion.id);
    setEditedContent(suggestion.suggestedAnswer);
  };

  const handleSaveEdit = (suggestion: AIAssistSuggestion) => {
    onEditSuggestion(suggestion, editedContent);
    setEditingId(null);
    setEditedContent('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedContent('');
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'knowledge':
        return <Database className="size-4 text-blue-500" />;
      case 'history':
        return <History className="size-4 text-green-500" />;
      case 'pattern':
        return <Brain className="size-4 text-purple-500" />;
      default:
        return <Lightbulb className="size-4 text-orange-500" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'knowledge':
        return '知识库';
      case 'history':
        return '历史记录';
      case 'pattern':
        return '模式匹配';
      default:
        return '智能推荐';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'knowledge':
        return 'bg-blue-100 text-blue-800';
      case 'history':
        return 'bg-green-100 text-green-800';
      case 'pattern':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  if (!selectedQuestion) {
    return (
      <Card className="h-full relative z-10">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Bot className="size-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">选择问题后显示AI建议和知识挖掘</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full relative z-10 flex flex-col">
      <CardHeader className="pb-1 space-y-1 shrink-0">
        <CardTitle className="flex items-center gap-1.5 text-sm">
          <Bot className="size-4 text-blue-500" />
          AI智能助手
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 pb-3 flex-1 overflow-hidden flex flex-col">
        {/* 上半部分：回复建议 */}
        <div className="flex-1 min-h-0 mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Bot className="size-3 text-blue-500" />
            <span className="text-xs font-medium">回复建议</span>
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{suggestions.length}</Badge>
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            针对「{selectedQuestion.question}」的智能分析
          </div>
          
          <ScrollArea className="h-full max-h-[calc((100vh-400px)/2)]">
            <div className="space-y-2 pr-4">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="border rounded p-2 bg-background relative z-20">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {getSourceIcon(suggestion.source)}
                      <Badge 
                        variant="secondary" 
                        className={`${getSourceColor(suggestion.source)} text-xs px-1.5 py-0.5`}
                      >
                        {getSourceLabel(suggestion.source)}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">置信度：</span>
                        <Progress 
                          value={suggestion.confidence * 100} 
                          className="w-12 h-1.5" 
                        />
                        <span className="text-xs text-muted-foreground">
                          {(suggestion.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {editingId === suggestion.id ? (
                    <div className="space-y-1.5">
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[60px] resize-none text-xs"
                        placeholder="编辑回复内容..."
                      />
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(suggestion)}
                          className="gap-1 h-6 px-2 text-xs"
                        >
                          <Check className="size-3" />
                          保存并发送
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="h-6 px-2 text-xs"
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="text-xs text-foreground leading-relaxed bg-muted/30 p-1.5 rounded">
                        {suggestion.suggestedAnswer}
                      </p>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => onAdoptSuggestion(suggestion)}
                          className="gap-1 h-6 px-2 text-xs"
                        >
                          <Check className="size-3" />
                          采纳回复
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEdit(suggestion)}
                          className="gap-1 h-6 px-2 text-xs"
                        >
                          <Edit className="size-3" />
                          编辑回复
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {suggestions.length === 0 && (
                <div className="text-center py-3">
                  <Bot className="size-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">
                    AI正在分析问题，暂无建议回答
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* 分隔线 */}
        <Separator className="my-3 shrink-0" />

        {/* 下半部分：知识挖掘 */}
        <div className="flex-1 min-h-0">
          <div className="flex items-center gap-1.5 mb-2">
            <Brain className="size-3 text-purple-500" />
            <span className="text-xs font-medium">知识挖掘</span>
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{pendingCandidates.length}</Badge>
          </div>
          
          <ScrollArea className="h-full max-h-[calc((100vh-400px)/2)]">
            <div className="space-y-2 pr-4">
              {pendingCandidates.map((candidate) => (
                <div key={candidate.id} className="border rounded p-2 bg-background relative z-20">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">新挖掘Q&A</Badge>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">置信度：</span>
                        <Progress 
                          value={candidate.confidence * 100} 
                          className="w-12 h-1.5" 
                        />
                        <span className="text-xs text-muted-foreground">
                          {(candidate.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 mb-2">
                    <div>
                      <span className="text-xs font-medium">问题：</span>
                      <p className="text-xs text-muted-foreground">{candidate.question}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium">建议回答：</span>
                      <p className="text-xs text-muted-foreground bg-muted/30 p-1.5 rounded">
                        {candidate.answer}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onQAEdit(candidate.id)}
                      className="text-blue-600 hover:text-blue-700 gap-1 h-6 px-2 text-xs"
                    >
                      <Edit className="size-3" />
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onQAAction(candidate.id, 'approve')}
                      className="text-green-600 hover:text-green-700 gap-1 h-6 px-2 text-xs"
                    >
                      <ThumbsUp className="size-3" />
                      点赞
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onQAAction(candidate.id, 'reject')}
                      className="text-red-600 hover:text-red-700 gap-1 h-6 px-2 text-xs"
                    >
                      <ThumbsDown className="size-3" />
                      点踩
                    </Button>
                  </div>
                </div>
              ))}

              {pendingCandidates.length === 0 && (
                <div className="text-center py-3">
                  <Brain className="size-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">
                    暂无新的Q&A候选等待处理
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}