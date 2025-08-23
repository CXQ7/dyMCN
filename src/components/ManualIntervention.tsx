import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { ThumbsUp, ThumbsDown, MessageCircle, Mic, Send, Brain, AlertTriangle } from 'lucide-react';
import { QACandidate, ManualReply } from '../types';

interface ManualInterventionProps {
  qaCandidates: QACandidate[];
  manualReplies: ManualReply[];
  onQAAction: (id: string, action: 'approve' | 'reject') => void;
  onManualReply: (id: string, reply: string) => void;
}

export function ManualIntervention({ qaCandidates, manualReplies, onQAAction, onManualReply }: ManualInterventionProps) {
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [isVoiceInput, setIsVoiceInput] = useState<Record<string, boolean>>({});

  const handleReplyChange = (id: string, value: string) => {
    setReplyTexts(prev => ({ ...prev, [id]: value }));
  };

  const handleSendReply = (id: string) => {
    const reply = replyTexts[id];
    if (reply && reply.trim()) {
      onManualReply(id, reply.trim());
      setReplyTexts(prev => ({ ...prev, [id]: '' }));
    }
  };

  const toggleVoiceInput = (id: string) => {
    setIsVoiceInput(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`;
    }
    return `${Math.floor(diffInMinutes / 60)}小时前`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Brain className="size-5 text-purple-500" />
          人工干预区
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="knowledge" className="h-[500px] flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="knowledge">结构化知识加分</TabsTrigger>
            <TabsTrigger value="manual">人工回复</TabsTrigger>
          </TabsList>
          
          <TabsContent value="knowledge" className="flex-1 mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {qaCandidates.map((candidate) => (
                  <div key={candidate.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">新挖掘Q&A</Badge>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">置信度：</span>
                          <Progress 
                            value={candidate.confidence * 100} 
                            className="w-16 h-2" 
                          />
                          <span className="text-xs text-muted-foreground">
                            {(candidate.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onQAAction(candidate.id, 'approve')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <ThumbsUp className="size-4 mr-1" />
                          点赞
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onQAAction(candidate.id, 'reject')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <ThumbsDown className="size-4 mr-1" />
                          点踩
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">问题：</span>
                        <p className="text-sm text-muted-foreground mt-1">{candidate.question}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">建议回答：</span>
                        <p className="text-sm text-muted-foreground mt-1">{candidate.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="manual" className="flex-1 mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {manualReplies.map((reply) => (
                  <div key={reply.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{reply.roomName}</Badge>
                        <span className="text-sm font-medium">{reply.userName}</span>
                        <Badge 
                          variant={reply.difficulty === 'high' ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {reply.difficulty === 'high' ? '高难度' : '中等难度'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <AlertTriangle className="size-3" />
                        {formatTime(reply.timestamp)}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-sm font-medium">用户问题：</span>
                      <p className="text-sm text-muted-foreground mt-1">{reply.question}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Textarea
                          placeholder="输入回复内容..."
                          value={replyTexts[reply.id] || ''}
                          onChange={(e) => handleReplyChange(reply.id, e.target.value)}
                          className="min-h-[80px] resize-none"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleVoiceInput(reply.id)}
                          className={isVoiceInput[reply.id] ? 'text-red-600' : ''}
                        >
                          <Mic className="size-4 mr-1" />
                          {isVoiceInput[reply.id] ? '停止录音' : '语音输入'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSendReply(reply.id)}
                          disabled={!replyTexts[reply.id]?.trim()}
                        >
                          <Send className="size-4 mr-1" />
                          发送回复
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}