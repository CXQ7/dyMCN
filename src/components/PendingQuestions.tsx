import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Clock } from "lucide-react";
import { PendingQuestion, LiveRoom } from "../types";

interface PendingQuestionsProps {
  questions: PendingQuestion[];
  liveRooms: LiveRoom[];
  selectedRoomId: string;
  onRoomSelect: (roomId: string) => void;
}

export function PendingQuestions({
  questions,
  liveRooms,
  selectedRoomId,
  onRoomSelect,
}: PendingQuestionsProps) {
  const filteredQuestions =
    selectedRoomId === "all"
      ? questions
      : questions.filter((q) => q.roomId === selectedRoomId);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );
    if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}小时前`;
    }
    return date.toLocaleDateString();
  };

  // 截断房间名称函数
  const truncateRoomName = (roomName: string, maxLength: number = 15) => {
    if (roomName.length <= maxLength) {
      return roomName;
    }
    return roomName.substring(0, maxLength) + "...";
  };

  return (
    <Card className="h-full flex flex-col relative z-10">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            待应答问题
            <Badge variant="destructive">{filteredQuestions.length}</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 min-h-0">
        <ScrollArea className="h-[calc(100vh-260px)]">
          <div className="space-y-3 pr-4">
            <TooltipProvider>
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="border rounded-lg p-3 hover:bg-muted/50 transition-colors bg-background relative z-20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="secondary"
                            className="max-w-[150px] truncate"
                          >
                            {truncateRoomName(question.roomName)}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{question.roomName}</p>
                        </TooltipContent>
                      </Tooltip>
                      <span className="text-sm font-medium truncate">
                        {question.userName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-2">
                      <Clock className="size-3" />
                      {formatTime(question.timestamp)}
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {question.question}
                  </p>
                </div>
              ))}
            </TooltipProvider>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
