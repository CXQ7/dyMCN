import { useState, useEffect } from "react";
import {
  PendingQuestion,
  AnsweredQuestion,
  Transaction,
  RoomMetrics,
} from "@/types";
import {
  getPendingQuestions,
  getAnsweredQuestions,
  getTransactions,
  getRoomMetrics,
} from "@/services/dataService";

export function useRealData() {
  const [pendingQuestions, setPendingQuestions] = useState<PendingQuestion[]>(
    []
  );
  const [answeredQuestions, setAnsweredQuestions] = useState<
    AnsweredQuestion[]
  >([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [roomMetrics, setRoomMetrics] = useState<RoomMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pendingData, answeredData, transactionData, metricsData] =
        await Promise.all([
          getPendingQuestions(),
          getAnsweredQuestions(),
          getTransactions(),
          getRoomMetrics(),
        ]);

      setPendingQuestions(pendingData);
      setAnsweredQuestions(answeredData);
      setTransactions(transactionData);
      setRoomMetrics(metricsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "数据加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = () => {
    loadData();
  };

  return {
    pendingQuestions,
    answeredQuestions,
    transactions,
    roomMetrics,
    loading,
    error,
    refreshData,
  };
}
