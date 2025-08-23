import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { ShoppingCart, TrendingUp, MessageCircle, Headphones } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionRelationProps {
  transactions: Transaction[];
}

export function TransactionRelation({ transactions }: TransactionRelationProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTimeDiff = (answerTime: Date, orderTime: Date) => {
    const diffInMinutes = Math.floor((orderTime.getTime() - answerTime.getTime()) / (1000 * 60));
    return `${diffInMinutes}分钟`;
  };

  const getChannelInfo = (channel: string) => {
    switch (channel) {
      case 'comment':
        return {
          label: '评论互动',
          icon: MessageCircle,
          color: 'text-blue-600',
          variant: 'default' as const
        };
      case 'presale':
        return {
          label: '售前客服',
          icon: Headphones,
          color: 'text-purple-600',
          variant: 'secondary' as const
        };
      default:
        return {
          label: '其他',
          icon: MessageCircle,
          color: 'text-gray-600',
          variant: 'outline' as const
        };
    }
  };

  return (
    <Card className="h-full flex flex-col relative z-10">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="size-5 text-orange-500" />
          成交关联
          <Badge variant="secondary">{transactions.length}</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">应答5分钟内的成交记录</p>
      </CardHeader>
      <CardContent className="pt-0 flex-1 min-h-0">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-3 pr-4">
            {transactions.map((transaction) => {
              const channelInfo = getChannelInfo(transaction.channel);
              const ChannelIcon = channelInfo.icon;
              
              return (
                <div key={transaction.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors bg-background relative z-20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{transaction.roomName}</Badge>
                      <span className="text-sm font-medium">{transaction.userName}</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      ¥{transaction.amount}
                    </Badge>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={channelInfo.variant} className="gap-1">
                        <ChannelIcon className="size-3" />
                        {channelInfo.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">商品：{transaction.productName}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">应答时间：</span>
                      {formatTime(transaction.answerTime)}
                    </div>
                    <div>
                      <span className="font-medium">下单时间：</span>
                      {formatTime(transaction.orderTime)}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="size-3" />
                    转化时长：{getTimeDiff(transaction.answerTime, transaction.orderTime)}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}