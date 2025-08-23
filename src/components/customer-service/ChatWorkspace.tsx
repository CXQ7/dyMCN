import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import {
  Mic,
  MicOff,
  Send,
  Image,
  Video,
  Link,
  User,
  ShoppingCart,
  MessageSquare,
  Calendar,
  History,
  Phone,
  Keyboard,
} from "lucide-react";
import {
  ServiceQuestion,
  CustomerInfo,
  ChatMessage,
} from "../../types";

interface ChatWorkspaceProps {
  selectedQuestion: ServiceQuestion | null;
  customerInfo: CustomerInfo | null;
  chatMessages: ChatMessage[];
  onSendMessage: (
    content: string,
    type: "text" | "image" | "video" | "link",
  ) => void;
}

type InputMode = 'phone' | 'voice' | 'text';

export function ChatWorkspace({
  selectedQuestion,
  customerInfo,
  chatMessages,
  onSendMessage,
}: ChatWorkspaceProps) {
  const [message, setMessage] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [isPhoneCallActive, setIsPhoneCallActive] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), "text");
      setMessage("");
    }
  };

  const handleModeChange = (mode: InputMode) => {
    setInputMode(mode);
    setIsRecording(false);
    setIsPhoneCallActive(false);
    
    // 激活电话语音模式时自动开始"通话"
    if (mode === 'phone') {
      setIsPhoneCallActive(true);
    }
  };

  // 处理空格键录音（仅在语音输入模式下）
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (inputMode !== 'voice') return;
    
    if (e.code === 'Space' && !isSpacePressed && !isRecording) {
      e.preventDefault();
      setIsSpacePressed(true);
      setIsRecording(true);
    }
  }, [inputMode, isSpacePressed, isRecording]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (inputMode !== 'voice') return;
    
    if (e.code === 'Space' && isSpacePressed) {
      e.preventDefault();
      setIsSpacePressed(false);
      setIsRecording(false);
    }
  }, [inputMode, isSpacePressed]);

  // 设置键盘事件监听器
  useEffect(() => {
    if (inputMode === 'voice') {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [inputMode, handleKeyDown, handleKeyUp]);

  // 模拟语音识别效果
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (isRecording && inputMode === 'voice') {
      // 语音输入模式：模拟录音后的文字识别
      timer = setTimeout(() => {
        const mockVoiceTexts = [
          "这个产品怎么样？",
          "请介绍一下这款商品的特点",
          "价格多少钱？",
          "有什么优惠活动吗？",
          "发货需要几天？"
        ];
        const randomText = mockVoiceTexts[Math.floor(Math.random() * mockVoiceTexts.length)];
        setMessage(prev => prev + (prev ? ' ' : '') + randomText);
      }, 1000 + Math.random() * 2000); // 1-3秒随机延迟
    }

    if (isPhoneCallActive && inputMode === 'phone') {
      // 电话语音模式：模拟持续的语音识别
      const interval = setInterval(() => {
        const mockPhoneTexts = [
          "您好，我想咨询一下",
          "请问这个商品",
          "能详细介绍吗",
          "谢谢您的解答"
        ];
        const randomText = mockPhoneTexts[Math.floor(Math.random() * mockPhoneTexts.length)];
        setMessage(prev => prev + (prev ? ' ' : '') + randomText);
      }, 3000 + Math.random() * 4000); // 3-7秒随机间隔

      return () => clearInterval(interval);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isRecording, isPhoneCallActive, inputMode]);

  const handleInsertLink = () => {
    const link = "https://shop.example.com/product/123";
    setMessage((prev) => prev + `[商品链接: ${link}] `);
  };

  const handleInsertImage = () => {
    setMessage((prev) => prev + "[插入图片] ");
  };

  const handleInsertVideo = () => {
    setMessage((prev) => prev + "[插入视频] ");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPlaceholderText = () => {
    switch (inputMode) {
      case 'phone':
        return isPhoneCallActive 
          ? "电话通话中，语音内容将自动转换为文字..."
          : "点击接听开始电话通话...";
      case 'voice':
        return "按住空格键开始录音，松开结束。可使用语音指令'插入图片'、'插入链接'等...";
      case 'text':
      default:
        return "输入回复内容...";
    }
  };

  if (!selectedQuestion) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MessageSquare className="size-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              请选择一个问题开始对话
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* 客户信息区 */}
      {customerInfo && (
        <Card className="shrink-0">
          <CardHeader className="pb-1 py-2">
            <CardTitle className="flex items-center gap-1 text-xs">
              <User className="size-3" />
              {customerInfo.userName}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 space-y-1.5">
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center">
                <div className="text-muted-foreground text-[10px]">
                  来访
                </div>
                <div className="font-medium">
                  {customerInfo.visitCount}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground text-[10px]">
                  互动
                </div>
                <div className="font-medium">
                  {customerInfo.interactionCount}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground text-[10px]">
                  提问
                </div>
                <div className="font-medium">
                  {customerInfo.questionCount}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground text-[10px]">
                  订单
                </div>
                <div className="font-medium">
                  {customerInfo.orderHistory.length}
                </div>
              </div>
            </div>

            <div className="flex justify-between text-xs">
              {/* 历史订单 */}
              {customerInfo.orderHistory.length > 0 && (
                <div className="flex-1 pr-2">
                  <div className="text-muted-foreground text-[10px] mb-0.5 flex items-center gap-0.5">
                    <ShoppingCart className="size-2.5" />
                    最近订单
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {customerInfo.orderHistory[0].productName} ¥
                    {customerInfo.orderHistory[0].amount}
                  </div>
                </div>
              )}

              {/* 近期沟通摘要 */}
              {customerInfo.recentCommunications.length > 0 && (
                <div className="flex-1 pl-2 border-l border-border">
                  <div className="text-muted-foreground text-[10px] mb-0.5 flex items-center gap-0.5">
                    <History className="size-2.5" />
                    近期沟通
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {customerInfo.recentCommunications[0]}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 对话区域 */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedQuestion.roomName}
              </Badge>
              <span className="text-base">
                {selectedQuestion.userName}
              </span>
            </div>
            <Badge
              variant={
                selectedQuestion.type === "presale"
                  ? "default"
                  : "secondary"
              }
            >
              {selectedQuestion.type === "presale"
                ? "售前咨询"
                : "商品评论"}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col pt-0">
          {/* 聊天记录 */}
          <ScrollArea className="flex-1 mb-4 border rounded-lg p-3 bg-muted/20">
            <div className="space-y-3">
              {/* 初始用户问题 */}
              <div className="flex justify-start">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2 max-w-[80%]">
                  <p className="text-sm">
                    {selectedQuestion.question}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(selectedQuestion.timestamp)}
                  </span>
                </div>
              </div>

              {/* 聊天记录 */}
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "customer" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`rounded-lg p-2 max-w-[80%] ${
                      msg.sender === "customer"
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-green-100 dark:bg-green-900/30"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* 输入区域 */}
          <div className="space-y-3">
            {/* 输入模式切换 */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={inputMode === 'phone' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleModeChange('phone')}
                  className="gap-2 h-8"
                >
                  <Phone className="size-4" />
                  电话语音
                </Button>
                <Button
                  variant={inputMode === 'voice' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleModeChange('voice')}
                  className="gap-2 h-8"
                >
                  <Mic className="size-4" />
                  语音输入
                </Button>
                <Button
                  variant={inputMode === 'text' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleModeChange('text')}
                  className="gap-2 h-8"
                >
                  <Keyboard className="size-4" />
                  文字输入
                </Button>
              </div>
              
              {/* 模式状态指示器 */}
              {inputMode === 'phone' && (
                <div className="flex items-center gap-2">
                  <Badge variant={isPhoneCallActive ? "default" : "secondary"} className="gap-1">
                    <div className={`size-2 rounded-full ${isPhoneCallActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    {isPhoneCallActive ? '通话中' : '已断开'}
                  </Badge>
                  <Button
                    variant={isPhoneCallActive ? "destructive" : "default"}
                    size="sm"
                    onClick={() => setIsPhoneCallActive(!isPhoneCallActive)}
                    className="gap-2"
                  >
                    {isPhoneCallActive ? "挂断" : "接听"}
                  </Button>
                </div>
              )}
              
              {inputMode === 'voice' && (
                <div className="flex items-center gap-2">
                  <Badge variant={isRecording ? "destructive" : "secondary"} className="gap-1">
                    <Mic className="size-3" />
                    {isRecording ? '录音中...' : '按住空格录音'}
                  </Badge>
                  {isRecording && (
                    <div className="flex items-center gap-1">
                      <div className="size-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs text-red-500">REC</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 快捷操作 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInsertImage}
                  className="gap-1"
                  disabled={inputMode === 'phone' && isPhoneCallActive}
                >
                  <Image className="size-4" />
                  图片
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInsertVideo}
                  className="gap-1"
                  disabled={inputMode === 'phone' && isPhoneCallActive}
                >
                  <Video className="size-4" />
                  视频
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInsertLink}
                  className="gap-1"
                  disabled={inputMode === 'phone' && isPhoneCallActive}
                >
                  <Link className="size-4" />
                  购物链接
                </Button>
              </div>
              
              {/* 操作提示 */}
              <div className="text-xs text-muted-foreground">
                {inputMode === 'phone' && (
                  <span>电话模式：持续语音识别</span>
                )}
                {inputMode === 'voice' && (
                  <span>语音模式：按空格键录音</span>
                )}
                {inputMode === 'text' && (
                  <span>文字模式：Enter发送，Shift+Enter换行</span>
                )}
              </div>
            </div>

            {/* 输入框和发送 */}
            <div className="flex gap-2">
              <Textarea
                placeholder={getPlaceholderText()}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[80px] resize-none flex-1"
                disabled={inputMode === 'phone' && isPhoneCallActive}
                onKeyDown={(e) => {
                  // 防止语音输入模式下空格键触发输入框
                  if (inputMode === 'voice' && e.code === 'Space') {
                    e.preventDefault();
                    return;
                  }
                  
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || (inputMode === 'phone' && isPhoneCallActive)}
                className="self-end"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}