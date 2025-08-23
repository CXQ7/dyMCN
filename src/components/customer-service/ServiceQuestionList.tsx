import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { MessageCircle, TrendingUp, Clock, Star } from 'lucide-react';
import { ServiceQuestion } from '../../types';

interface ServiceQuestionListProps {
  questions: ServiceQuestion[];
  selectedQuestionId: string | null;
  serviceMode: 'auto' | 'manual';
  onQuestionSelect: (question: ServiceQuestion) => void;
  onServiceModeChange: (mode: 'auto' | 'manual') => void;
}

export function ServiceQuestionList({ 
  questions, 
  selectedQuestionId, 
  serviceMode,
  onQuestionSelect,
  onServiceModeChange
}: ServiceQuestionListProps) {
  // 按优先级和历史记录排序
  const sortedQuestions = [...questions].sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (b.priority === 'high' && a.priority !== 'high') return 1;
    if (a.hasHistory && !b.hasHistory) return -1;
    if (b.hasHistory && !a.hasHistory) return 1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`;
    }
    return `${Math.floor(diffInMinutes / 60)}小时前`;
  };

  const getTypeLabel = (type: string) => {
    return type === 'presale' ? '售前' : '评论';
  };

  const getTypeColor = (type: string) => {
    return type === 'presale' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="size-5 text-blue-500" />
            机器推荐问题
            <Badge variant="secondary">{questions.length}</Badge>
          </CardTitle>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">服务模式：</span>
            <Switch
              checked={serviceMode === 'manual'}
              onCheckedChange={(checked) => onServiceModeChange(checked ? 'manual' : 'auto')}
            />
            <span className="font-medium">
              {serviceMode === 'manual' ? '有人模式' : '无人模式'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-3">
            {sortedQuestions.map((question) => (
              <div
                key={question.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                  selectedQuestionId === question.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => onQuestionSelect(question)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant="secondary" 
                      className={getTypeColor(question.type)}
                    >
                      {getTypeLabel(question.type)}
                    </Badge>
                    <Badge variant="outline">{question.roomName}</Badge>
                    <span className="text-sm font-medium">{question.userName}</span>
                    
                    {question.priority === 'high' && (
                      <Badge variant="destructive" className="gap-1">
                        <TrendingUp className="size-3" />
                        高优
                      </Badge>
                    )}
                    
                    {question.hasHistory && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="size-3" />
                        回头客
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {formatTime(question.timestamp)}
                  </div>
                </div>
                
                <p className="text-sm text-foreground leading-relaxed mb-2">
                  {question.question}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>互动次数: {question.interactionCount}</span>
                  {serviceMode === 'auto' && (
                    <Badge variant="outline" className="text-xs">
                      AI处理中
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}