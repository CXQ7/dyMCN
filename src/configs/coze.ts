/**
 * Coze API 配置
 */
export const COZE_CONFIG = {
  token: "sat_wxIoMA1IL903uZBGqrccumvwoVuyrsHmx0oZuuAxB6I60cRST9tHC5eb1o9zstsb",
  baseURL: "https://api.coze.cn",

  workflows: {
    danmuAnalysis: "7538406479310258230",
    dataMining: "7539048575411585060",
  },
} as const;

/**
 * 工作流类型枚举
 */
export enum WorkflowType {
  DANMU_ANALYSIS = "danmuAnalysis",
  DATA_MINING = "dataMining",
}

/**
 * 弹幕分析参数接口
 */
export interface DanmuAnalysisParams {
  check: boolean;
  live_room_id: number;
  text: string;
}

/**
 * 数据挖掘参数接口
 */
export interface DataMiningParams {
  file: string;
  live_room_id: number;
}

/**
 * 弹幕分析返回结果接口
 */
export interface DanmuAnalysisResponse {
  check: boolean;
  model_output: string | null;
  query: number;
}
