import { supabase } from "./supabaseClient";
import {
  PendingQuestion,
  AnsweredQuestion,
  Transaction,
  RoomMetrics,
} from "../../types";

// 从数据库获取待应答问题
export async function getPendingQuestions(): Promise<PendingQuestion[]> {
  try {
    const { data: questions, error } = await supabase
      .from("qa_pairs")
      .select(
        `
        id,
        question,
        created_at,
        live_rooms!inner(platform_id, name)
      `
      )
      .eq("source", null) // 假设待应答的问题source为null
      .order("created_at", { ascending: false });

    if (error) {
      console.error("获取待应答问题失败:", error);
      return [];
    }

    return (questions || []).map((q: any) => ({
      id: q.id.toString(),
      roomId: q.live_rooms.platform_id,
      roomName: q.live_rooms.name,
      userName: "用户" + Math.floor(Math.random() * 1000), // 临时用户名
      question: q.question,
      timestamp: new Date(q.created_at),
    }));
  } catch (error) {
    console.error("获取待应答问题异常:", error);
    return [];
  }
}

// 从数据库获取已应答问题
export async function getAnsweredQuestions(): Promise<AnsweredQuestion[]> {
  try {
    const { data: questions, error } = await supabase
      .from("qa_pairs")
      .select(
        `
        id,
        question,
        answer,
        created_at,
        updated_at,
        live_rooms!inner(platform_id, name)
      `
      )
      .not("answer", "is", null)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("获取已应答问题失败:", error);
      return [];
    }

    return (questions || []).map((q: any) => ({
      id: q.id.toString(),
      roomId: q.live_rooms.platform_id,
      roomName: q.live_rooms.name,
      userName: "用户" + Math.floor(Math.random() * 1000), // 临时用户名
      question: q.question,
      answer: q.answer,
      timestamp: new Date(q.created_at),
      answerTime: new Date(q.updated_at),
    }));
  } catch (error) {
    console.error("获取已应答问题异常:", error);
    return [];
  }
}

// 生成基于真实直播间的指标数据
export async function getRoomMetrics(): Promise<RoomMetrics[]> {
  try {
    const { data: rooms, error: roomsError } = await supabase
      .from("live_rooms")
      .select("*")
      .order("created_at", { ascending: false });

    if (roomsError) {
      console.error("获取直播间失败:", roomsError);
      return [];
    }

    if (!rooms || rooms.length === 0) {
      return [];
    }

    const metrics: RoomMetrics[] = [];

    for (const room of rooms) {
      // 获取该直播间的Q&A统计
      const { data: qaStats } = await supabase
        .from("qa_pairs")
        .select("id, answer")
        .eq("live_room_id", room.id);

      // 获取该房间的问题数据
      const { data: questions } = await supabase
        .from("questions")
        .select("*")
        .eq("live_room_id", room.id);

      // 获取该房间的对话数据
      const { data: conversations } = await supabase
        .from("conversations")
        .select("*, question_id")
        .not("question_id", "is", null);

      // 获取该房间的订单数据
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("live_room_id", room.id);

      // 获取该房间的客户数据
      const { data: customers } = await supabase
        .from("customers")
        .select("*")
        .eq("live_room_id", room.id);

      const totalQA = qaStats?.length || 0;
      const answeredQA = qaStats?.filter((qa) => qa.answer).length || 0;
      const pendingQA = totalQA - answeredQA;

      // 计算真实的转化率指标
      const totalQuestions = questions?.length || 0;
      const answeredQuestions =
        questions?.filter((q) => q.status === "answered").length || 0;
      const totalOrders = orders?.length || 0;
      const responseRelatedOrders =
        orders?.filter((o) => o.is_response_related).length || 0;

      // 整体转化率 = 有订单的对话数量 / 总对话数量
      const conversionRate =
        answeredQuestions > 0
          ? (responseRelatedOrders / answeredQuestions) * 100
          : 0;

      // 售前转化率 = 售前相关订单 / 总订单
      const presaleOrders =
        orders?.filter((o) => o.related_question_id !== null).length || 0;
      const presaleConversionRate =
        totalOrders > 0 ? (presaleOrders / totalOrders) * 100 : 0;

      // 评论转化率 = 评论相关订单 / 总订单
      const commentOrders =
        orders?.filter((o) => o.related_response_id !== null).length || 0;
      const commentConversionRate =
        totalOrders > 0 ? (commentOrders / totalOrders) * 100 : 0;

      // 计算平均响应时间
      const responseConversations =
        conversations?.filter((c) => c.response_time_ms !== null) || [];
      const avgCommentResponseTime =
        responseConversations.length > 0
          ? responseConversations.reduce(
              (sum, c) => sum + (c.response_time_ms || 0),
              0
            ) /
            responseConversations.length /
            1000 // 转换为秒
          : 0;

      // 售前响应时间（假设售前问题优先级更高）
      const presaleQuestions = questions?.filter((q) => q.priority > 0) || [];
      const presaleResponseTime = avgCommentResponseTime * 1.2; // 售前通常稍慢

      // 计算平均停留时长（基于客户互动次数估算）
      const totalInteractions =
        customers?.reduce((sum, c) => sum + c.interaction_count, 0) || 0;
      const avgStayDuration =
        customers && customers.length > 0
          ? (totalInteractions / customers.length) * 120 // 假设每次互动代表2分钟停留
          : 0;

      // 售前引流量（有相关问题的客户数量）
      const presaleLeadCount =
        customers?.filter((c) => {
          return questions?.some(
            (q) => q.customer_id === c.id && q.priority > 0
          );
        }).length || 0;

      // 计算成交金额
      const totalAmount =
        orders?.reduce((sum, o) => sum + parseFloat(o.amount.toString()), 0) ||
        0;
      const presaleAmount =
        orders
          ?.filter((o) => o.related_question_id !== null)
          .reduce((sum, o) => sum + parseFloat(o.amount.toString()), 0) || 0;
      const commentAmount = totalAmount - presaleAmount;

      // 生成基础指标（这些可以后续从真实数据源获取）
      const onlineHistory = Array.from({ length: 60 }, () =>
        Math.floor(Math.random() * 100)
      );
      const newJoinHistory = Array.from({ length: 60 }, () =>
        Math.floor(Math.random() * 20)
      );

      metrics.push({
        roomId: room.platform_id,
        roomName: room.name,
        pendingCount: pendingQA,
        answeredCount: answeredQA,
        knowledgeCount: totalQA,
        conversionRate,
        presaleConversionRate,
        commentConversionRate,
        presaleAmount,
        commentAmount,
        onlineHistory,
        newJoinHistory,
        commentResponseTime: avgCommentResponseTime,
        presaleResponseTime,
        averageStayDuration: avgStayDuration,
        presaleLeadCount,
      });
    }

    return metrics;
  } catch (error) {
    console.error("获取房间指标异常:", error);
    return [];
  }
}

// 获取空的交易数据（因为还没有交易表）
export async function getTransactions(): Promise<Transaction[]> {
  // 暂时返回空数组，等待交易功能实现
  return [];
}
