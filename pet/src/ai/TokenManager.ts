/**
 * Token 管理器
 * 追踪和管理 AI Token 使用情况
 */

import type { AIProvider, TokenUsage } from './types';

export interface TokenRecord {
  id: string;
  provider: AIProvider;
  taskType: string;
  usage: TokenUsage;
  timestamp: number;
  prompt?: string;        // 可选：保存提示词
  response?: string;      // 可选：保存响应
}

export interface TokenStatistics {
  provider: AIProvider;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: number;
  taskCount: number;
  averageTokensPerTask: number;
}

export class TokenManager {
  private records: TokenRecord[] = [];
  private maxRecords: number = 1000; // 最多保存的记录数

  /**
   * 添加 Token 使用记录
   */
  addRecord(
    provider: AIProvider,
    taskType: string,
    usage: TokenUsage,
    options?: {
      prompt?: string;
      response?: string;
    }
  ): TokenRecord {
    const record: TokenRecord = {
      id: this.generateId(),
      provider,
      taskType,
      usage,
      timestamp: Date.now(),
      prompt: options?.prompt,
      response: options?.response,
    };

    this.records.push(record);

    // 限制记录数量
    if (this.records.length > this.maxRecords) {
      this.records.shift();
    }

    return record;
  }

  /**
   * 获取所有记录
   */
  getAllRecords(): TokenRecord[] {
    return [...this.records];
  }

  /**
   * 获取指定时间范围的记录
   */
  getRecordsByTimeRange(startTime: number, endTime: number): TokenRecord[] {
    return this.records.filter(
      (record) => record.timestamp >= startTime && record.timestamp <= endTime
    );
  }

  /**
   * 获取指定提供商的记录
   */
  getRecordsByProvider(provider: AIProvider): TokenRecord[] {
    return this.records.filter((record) => record.provider === provider);
  }

  /**
   * 获取指定任务类型的记录
   */
  getRecordsByTaskType(taskType: string): TokenRecord[] {
    return this.records.filter((record) => record.taskType === taskType);
  }

  /**
   * 获取统计信息（所有提供商）
   */
  getTotalStatistics(): TokenStatistics[] {
    const statsMap = new Map<AIProvider, TokenStatistics>();

    for (const record of this.records) {
      if (!statsMap.has(record.provider)) {
        statsMap.set(record.provider, {
          provider: record.provider,
          totalInputTokens: 0,
          totalOutputTokens: 0,
          totalTokens: 0,
          totalCost: 0,
          taskCount: 0,
          averageTokensPerTask: 0,
        });
      }

      const stats = statsMap.get(record.provider)!;
      stats.totalInputTokens += record.usage.inputTokens;
      stats.totalOutputTokens += record.usage.outputTokens;
      stats.totalTokens += record.usage.totalTokens;
      stats.totalCost += record.usage.estimatedCost || 0;
      stats.taskCount += 1;
    }

    // 计算平均值
    statsMap.forEach((stats) => {
      stats.averageTokensPerTask = stats.totalTokens / stats.taskCount;
    });

    return Array.from(statsMap.values());
  }

  /**
   * 获取指定提供商的统计信息
   */
  getStatisticsByProvider(provider: AIProvider): TokenStatistics | null {
    const records = this.getRecordsByProvider(provider);
    if (records.length === 0) {
      return null;
    }

    const stats: TokenStatistics = {
      provider,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      totalCost: 0,
      taskCount: records.length,
      averageTokensPerTask: 0,
    };

    for (const record of records) {
      stats.totalInputTokens += record.usage.inputTokens;
      stats.totalOutputTokens += record.usage.outputTokens;
      stats.totalTokens += record.usage.totalTokens;
      stats.totalCost += record.usage.estimatedCost || 0;
    }

    stats.averageTokensPerTask = stats.totalTokens / stats.taskCount;

    return stats;
  }

  /**
   * 获取今日统计
   */
  getTodayStatistics(): TokenStatistics[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startTime = today.getTime();
    const endTime = Date.now();

    const todayRecords = this.getRecordsByTimeRange(startTime, endTime);

    // 临时替换 records 来复用统计逻辑
    const originalRecords = this.records;
    this.records = todayRecords;
    const stats = this.getTotalStatistics();
    this.records = originalRecords;

    return stats;
  }

  /**
   * 清空记录
   */
  clearRecords(): void {
    this.records = [];
  }

  /**
   * 导出记录为 JSON
   */
  exportToJSON(): string {
    return JSON.stringify(this.records, null, 2);
  }

  /**
   * 从 JSON 导入记录
   */
  importFromJSON(json: string): void {
    try {
      const records = JSON.parse(json);
      if (Array.isArray(records)) {
        this.records = records;
      }
    } catch (error) {
      console.error('Failed to import records:', error);
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

// 导出单例
export const tokenManager = new TokenManager();
