import { supabase } from "@/configs/supabase";
import { PendingQuestion } from "@/types";

/**
 * 待应答问题数据库字段接口
 */
export interface QuestionData {
  id: number;
  live_room_id: number;
  customer_id: number;
  content: string;
  status: "pending" | "answered" | "ignored";
  priority: number;
  created_at: string;
  updated_at: string;
  // 关联数据
  live_rooms?: {
    platform_id: string;
    name: string;
  };
  customers?: {
    nickname: string;
  };
}

/**
 * 待应答问题服务
 * 负责管理待应答问题的CRUD操作 
 */
class PendingQuestionsService {
  /**
   * 获取所有待应答问题
   * @param roomId 可选的直播间platform_id过滤
   * @returns 待应答问题列表
   */
  public async getAllPendingQuestions(
    roomId?: string
  ): Promise<PendingQuestion[]> {
    try {
      let query = supabase
        .from("questions")
        .select(
          `
          *,
          live_rooms!inner(platform_id, name),
          customers!inner(nickname)
        `
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (roomId) {
        query = query.eq("live_rooms.platform_id", roomId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("获取待应答问题失败:", error);
        return [];
      }

      return (data as QuestionData[]).map(this.transformQuestionData);
    } catch (error) {
      console.error("获取待应答问题异常:", error);
      return [];
    }
  }

  /**
   * 根据ID获取待应答问题
   * @param id 问题ID
   * @returns 待应答问题或null
   */
  public async getPendingQuestionById(
    id: string
  ): Promise<PendingQuestion | null> {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select(
          `
          *,
          live_rooms!inner(platform_id, name),
          customers!inner(nickname)
        `
        )
        .eq("id", parseInt(id))
        .single();

      if (error) {
        console.error("获取待应答问题详情失败:", error);
        return null;
      }

      return this.transformQuestionData(data as QuestionData);
    } catch (error) {
      console.error("获取待应答问题详情异常:", error);
      return null;
    }
  }

  /**
   * 更新问题状态
   * @param id 问题ID
   * @param status 新状态
   * @returns 是否更新成功
   */
  public async updateQuestionStatus(
    id: string,
    status: "pending" | "answered" | "ignored"
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("questions")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", parseInt(id));

      if (error) {
        console.error("更新问题状态失败:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("更新问题状态异常:", error);
      return false;
    }
  }

  /**
   * 删除待应答问题
   * @param id 问题ID
   * @returns 是否删除成功
   */
  public async deletePendingQuestion(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", parseInt(id));

      if (error) {
        console.error("删除待应答问题失败:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("删除待应答问题异常:", error);
      return false;
    }
  }

  /**
   * 批量删除待应答问题
   * @param ids 问题ID数组
   * @returns 是否删除成功
   */
  public async deletePendingQuestionsBatch(ids: string[]): Promise<boolean> {
    try {
      const numericIds = ids.map((id) => parseInt(id));
      const { error } = await supabase
        .from("questions")
        .delete()
        .in("id", numericIds);

      if (error) {
        console.error("批量删除待应答问题失败:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("批量删除待应答问题异常:", error);
      return false;
    }
  }

  /**
   * 获取待应答问题统计
   * @param roomId 可选的直播间platform_id过滤
   * @returns 统计信息
   */
  public async getPendingQuestionsStats(roomId?: string): Promise<{
    total: number;
    byRoom: Record<string, number>;
  }> {
    try {
      let query = supabase
        .from("questions")
        .select(
          `
          live_rooms!inner(platform_id, name)
        `
        )
        .eq("status", "pending");

      if (roomId) {
        query = query.eq("live_rooms.platform_id", roomId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("获取待应答问题统计失败:", error);
        return { total: 0, byRoom: {} };
      }

      const byRoom: Record<string, number> = {};
      data.forEach((item: any) => {
        const key = `${item.live_rooms.name}(${item.live_rooms.platform_id})`;
        byRoom[key] = (byRoom[key] || 0) + 1;
      });

      return {
        total: data.length,
        byRoom,
      };
    } catch (error) {
      console.error("获取待应答问题统计异常:", error);
      return { total: 0, byRoom: {} };
    }
  }

  /**
   * 转换数据库数据为前端格式
   * @param dbData 数据库数据
   * @returns 前端格式数据
   */
  private transformQuestionData(dbData: QuestionData): PendingQuestion {
    return {
      id: dbData.id.toString(),
      roomId: dbData.live_rooms?.platform_id || "",
      roomName: dbData.live_rooms?.name || "未知直播间",
      userName: dbData.customers?.nickname || "匿名用户",
      question: dbData.content,
      timestamp: new Date(dbData.created_at),
    };
  }
}

// 导出单例实例
export const pendingQuestionsService = new PendingQuestionsService();
