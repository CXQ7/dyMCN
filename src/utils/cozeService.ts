import { CozeAPI } from "@coze/api";
import {
  COZE_CONFIG,
  WorkflowType,
  DanmuAnalysisParams,
  DataMiningParams,
} from "../configs/coze";

/**
 * Coze API 工具类
 * 封装了弹幕分析和数据挖掘的工作流调用
 */
export class CozeService {
  private apiClient: CozeAPI;

  constructor() {
    this.apiClient = new CozeAPI({
      token: COZE_CONFIG.token,
      baseURL: COZE_CONFIG.baseURL,
    });
  }

  /**
   * 执行弹幕分析工作流
   * @param params 弹幕分析参数
   * @returns 工作流执行结果
   */
  async analyzeDanmu(params: DanmuAnalysisParams) {
    try {
      const res = await this.apiClient.workflows.runs.create({
        workflow_id: COZE_CONFIG.workflows.danmuAnalysis,
        parameters: {
          input: {
            check: params.check,
            live_room_id: params.live_room_id,
            text: params.text,
          },
        },
      });

      return {
        success: true,
        data: res.data,
        error: null,
      };
    } catch (error) {
      console.error("弹幕分析工作流执行失败:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "未知错误",
      };
    }
  }

  /**
   * 执行数据挖掘工作流
   * @param params 数据挖掘参数
   * @returns 工作流执行结果
   */
  async mineData(params: DataMiningParams) {
    try {
      const res = await this.apiClient.workflows.runs.create({
        workflow_id: COZE_CONFIG.workflows.dataMining,
        parameters: {
          file: params.file,
          live_room_id: params.live_room_id,
        },
      });

      return {
        success: true,
        data: res.data,
        error: null,
      };
    } catch (error) {
      console.error("数据挖掘工作流执行失败:", error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "未知错误",
      };
    }
  }

  /**
   * 通用工作流执行方法
   * @param workflowType 工作流类型
   * @param parameters 工作流参数
   * @returns 工作流执行结果
   */
  async runWorkflow(workflowType: WorkflowType, parameters: any) {
    try {
      const workflowId = COZE_CONFIG.workflows[workflowType];
      if (!workflowId) {
        throw new Error(`未找到工作流类型: ${workflowType}`);
      }

      const res = await this.apiClient.workflows.runs.create({
        workflow_id: workflowId,
        parameters,
      });

      return {
        success: true,
        data: res.data,
        error: null,
      };
    } catch (error) {
      console.error(`工作流 ${workflowType} 执行失败:`, error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "未知错误",
      };
    }
  }
}

// 导出单例实例
export const cozeService = new CozeService();
