import { cozeService } from "@/utils/cozeService";
import { supabase } from "@/configs/supabase";
import { PendingQuestion } from "@/types";
import { DanmuAnalysisResponse } from "@/configs/coze";

// 弹幕消息接口
export interface DanmuMessage {
  room_id: string;
  method: string;
  content: string;
  timestamp: number;
  user_info?: {
    nickname: string;
    avatar: string;
  };
}

// 弹幕分析结果接口
export interface DanmuAnalysisResult {
  isQuestion: boolean;
  roomId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

/**
 * 弹幕分析服务
 * 负责处理直播间弹幕，判断是否为提问并存储到待应答问题中
 */
class DanmuAnalysisService {
  private processingQueue: Map<string, DanmuMessage[]> = new Map();
  private isProcessing = false;
  private batchSize = 10; // 批处理大小
  private batchTimeout = 2000; // 批处理超时时间（毫秒）

  /**
   * 处理单条弹幕消息
   * @param message 弹幕消息
   */
  public async processDanmu(message: DanmuMessage): Promise<void> {
    // 只处理聊天消息
    if (
      message.method !== "chat" &&
      message.method !== "message" &&
      message.method !== "WebcastChatMessage"
    ) {
      console.log(`[DanmuAnalysisService] 跳过非聊天消息: ${message.method}`);
      return;
    }

    // 过滤空消息或无用户信息的消息
    if (!message.content || !message.user_info?.nickname) {
      console.log(`[DanmuAnalysisService] 跳过空消息或无用户信息的消息`);
      return;
    }

    console.log(
      `[DanmuAnalysisService] 收到弹幕: ${message.room_id} - ${message.user_info.nickname}: ${message.content}`
    );

    try {
      // 调用Coze API判断是否为提问
      const analysisResult = await this.analyzeDanmuWithCoze(message);

      console.log(
        `[DanmuAnalysisService] Coze分析结果: ${message.content} -> isQuestion: ${analysisResult.isQuestion}`
      );

      if (analysisResult.isQuestion) {
        console.log(`[DanmuAnalysisService] 识别到提问: ${message.content}`);
        // 存储到待应答问题
        await this.savePendingQuestion(analysisResult);
      } else {
        console.log(`[DanmuAnalysisService] 非提问内容: ${message.content}`);
      }
    } catch (error) {
      console.error(`[DanmuAnalysisService] 处理弹幕失败:`, error);
    }
  }

  /**
   * 使用Coze API分析弹幕
   * @param message 弹幕消息
   * @returns 分析结果
   */
  private async analyzeDanmuWithCoze(
    message: DanmuMessage
  ): Promise<DanmuAnalysisResult> {
    try {
      const result = await cozeService.analyzeDanmu({
        check: false, // 不查询数据库，只判断是否为提问
        live_room_id: parseInt(message.room_id) || 0,
        text: message.content,
      });

      // 解析返回数据
      let isQuestion = false;
      if (result.success && (result as any).data) {
        try {
          // 尝试解析数据
          const data =
            typeof (result as any).data === "string"
              ? JSON.parse((result as any).data)
              : (result as any).data;
          isQuestion = data?.query === 1;
        } catch (error) {
          console.warn(`[DanmuAnalysisService] 解析返回数据失败:`, error);
        }
      }

      return {
        isQuestion,
        roomId: message.room_id,
        userName: message.user_info?.nickname || "匿名用户",
        content: message.content,
        timestamp: new Date(message.timestamp),
      };
    } catch (error) {
      console.error(`[DanmuAnalysisService] Coze API调用失败:`, error);
      return {
        isQuestion: false,
        roomId: message.room_id,
        userName: message.user_info?.nickname || "匿名用户",
        content: message.content,
        timestamp: new Date(message.timestamp),
      };
    }
  }

  /**
   * 保存待应答问题到数据库
   * @param analysisResult 分析结果
   */
  private async savePendingQuestion(
    analysisResult: DanmuAnalysisResult
  ): Promise<void> {
    try {
      // 获取直播间信息
      const { data: roomData } = await supabase
        .from("live_rooms")
        .select("id, name")
        .eq("platform_id", analysisResult.roomId)
        .single();

      if (!roomData) {
        console.warn(
          `[DanmuAnalysisService] 未找到直播间: ${analysisResult.roomId}`
        );
        return;
      }

      // 获取或创建客户记录
      let customerId: number;
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("live_room_id", roomData.id)
        .eq("nickname", analysisResult.userName)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
        // 使用RPC函数来增加互动次数
        await supabase.rpc("increment_interaction_count", {
          customer_id: customerId,
        });
      } else {
        // 创建新客户
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            live_room_id: roomData.id,
            platform_id: `${analysisResult.roomId}_${analysisResult.userName}`,
            nickname: analysisResult.userName,
            interaction_count: 1,
          })
          .select("id")
          .single();

        if (customerError || !newCustomer) {
          console.error(`[DanmuAnalysisService] 创建客户失败:`, customerError);
          return;
        }
        customerId = newCustomer.id;
      }

      // 检查是否已存在相同的问题（避免重复）
      const { data: existingQuestions } = await supabase
        .from("questions")
        .select("id")
        .eq("live_room_id", roomData.id)
        .eq("customer_id", customerId)
        .eq("content", analysisResult.content)
        .eq("status", "pending")
        .gte("created_at", new Date(Date.now() - 60000).toISOString()); // 1分钟内的重复问题

      if (existingQuestions && existingQuestions.length > 0) {
        console.log(
          `[DanmuAnalysisService] 跳过重复问题: ${analysisResult.content}`
        );
        return;
      }

      // 插入新的待应答问题
      const { data, error } = await supabase
        .from("questions")
        .insert({
          live_room_id: roomData.id,
          customer_id: customerId,
          content: analysisResult.content,
          status: "pending",
          priority: 0,
          created_at: analysisResult.timestamp.toISOString(),
          updated_at: analysisResult.timestamp.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error(`[DanmuAnalysisService] 保存待应答问题失败:`, error);
        return;
      }

      console.log(`[DanmuAnalysisService] 成功保存待应答问题: ${data.id}`);

      // 可以在这里触发实时更新通知
      this.notifyNewPendingQuestion({
        id: data.id.toString(),
        roomId: analysisResult.roomId,
        roomName: roomData.name,
        userName: analysisResult.userName,
        question: analysisResult.content,
        timestamp: analysisResult.timestamp,
      });
    } catch (error) {
      console.error(`[DanmuAnalysisService] 保存待应答问题异常:`, error);
    }
  }

  /**
   * 通知有新的待应答问题
   * @param question 新问题
   */
  private notifyNewPendingQuestion(question: PendingQuestion): void {
    // 这里可以实现WebSocket推送或者事件发布
    // 暂时只打印日志
    console.log(`[DanmuAnalysisService] 新待应答问题通知:`, {
      id: question.id,
      roomName: question.roomName,
      userName: question.userName,
      question: question.question,
    });
  }

  /**
   * 批量处理弹幕（备用方法，如果需要批处理优化）
   * @param messages 弹幕消息数组
   */
  public async processDanmuBatch(messages: DanmuMessage[]): Promise<void> {
    console.log(`[DanmuAnalysisService] 开始批量处理${messages.length}条弹幕`);

    const promises = messages.map((message) => this.processDanmu(message));
    await Promise.allSettled(promises);

    console.log(`[DanmuAnalysisService] 批量处理完成`);
  }

  /**
   * 获取处理统计信息
   */
  public getStats(): { queueSize: number; isProcessing: boolean } {
    return {
      queueSize: Array.from(this.processingQueue.values()).reduce(
        (sum, arr) => sum + arr.length,
        0
      ),
      isProcessing: this.isProcessing,
    };
  }
}

// 导出单例实例
export const danmuAnalysisService = new DanmuAnalysisService();
