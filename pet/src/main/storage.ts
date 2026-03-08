/**
 * 数据持久化管理
 * 使用 electron-store 保存数据到本地
 */

import Store from 'electron-store';

// 宠物状态数据结构
export interface PetStateData {
  hunger: number;
  cleanliness: number;
  mood: number;
  energy: number;
  level: number;
  experience: number;
  lastUpdateTime: number;
}

// 设置数据结构
export interface SettingsData {
  // AI 配置
  ai: {
    provider: 'claude' | 'openclaw';
    apiKey?: string;
    baseUrl?: string;
    defaultModel?: string;
  };

  // 宠物设置
  pet: {
    name: string;
    skin: string;
    roamingEnabled: boolean;
    roamingSpeed: number;
  };

  // 通知设置
  notifications: {
    enabled: boolean;
    hungerThreshold: number;
    cleanlinessThreshold: number;
  };

  // 窗口设置
  window: {
    alwaysOnTop: boolean;
    startWithSystem: boolean;
  };
}

// Token 使用记录
export interface TokenRecord {
  id: string;
  provider: string;
  taskType: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  timestamp: number;
  prompt?: string;
  response?: string;
}

// 对话历史记录
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

// Store Schema
interface StoreSchema {
  petState: PetStateData;
  settings: SettingsData;
  tokenRecords: TokenRecord[];
  chatHistory: ChatMessage[];
  firstRunTime: number;
}

// 默认配置
const defaultPetState: PetStateData = {
  hunger: 100,
  cleanliness: 100,
  mood: 100,
  energy: 100,
  level: 1,
  experience: 0,
  lastUpdateTime: Date.now(),
};

const defaultSettings: SettingsData = {
  ai: {
    provider: 'claude',
    defaultModel: 'claude-opus-4-5-20251101',
  },
  pet: {
    name: 'Cyber Mate',
    skin: 'default',
    roamingEnabled: false,
    roamingSpeed: 1,
  },
  notifications: {
    enabled: true,
    hungerThreshold: 30,
    cleanlinessThreshold: 30,
  },
  window: {
    alwaysOnTop: true,
    startWithSystem: false,
  },
};

// 创建 Store 实例
const store = new Store<StoreSchema>({
  defaults: {
    petState: defaultPetState,
    settings: defaultSettings,
    tokenRecords: [],
    chatHistory: [],
    firstRunTime: Date.now(),
  },
  // 加密敏感数据
  encryptionKey: 'cyber-mate-pet-2026',
});

// Storage 管理类
export class StorageManager {
  // ========== 宠物状态 ==========

  static getPetState(): PetStateData {
    return store.get('petState', defaultPetState);
  }

  static savePetState(state: Partial<PetStateData>): void {
    const current = this.getPetState();
    store.set('petState', {
      ...current,
      ...state,
      lastUpdateTime: Date.now(),
    });
  }

  static resetPetState(): void {
    store.set('petState', defaultPetState);
  }

  // ========== 设置 ==========

  static getSettings(): SettingsData {
    return store.get('settings', defaultSettings);
  }

  static saveSettings(settings: Partial<SettingsData>): void {
    const current = this.getSettings();
    store.set('settings', {
      ai: { ...current.ai, ...settings.ai },
      pet: { ...current.pet, ...settings.pet },
      notifications: { ...current.notifications, ...settings.notifications },
      window: { ...current.window, ...settings.window },
    });
  }

  static getAISettings() {
    return this.getSettings().ai;
  }

  static saveAISettings(ai: Partial<SettingsData['ai']>): void {
    const current = this.getSettings();
    store.set('settings.ai', { ...current.ai, ...ai });
  }

  // ========== Token 记录 ==========

  static getTokenRecords(): TokenRecord[] {
    return store.get('tokenRecords', []);
  }

  static addTokenRecord(record: Omit<TokenRecord, 'id' | 'timestamp'>): void {
    const records = this.getTokenRecords();
    const newRecord: TokenRecord = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    // 只保留最近 1000 条记录
    const updatedRecords = [...records, newRecord].slice(-1000);
    store.set('tokenRecords', updatedRecords);
  }

  static getTokenRecordsByDateRange(startDate: number, endDate: number): TokenRecord[] {
    const records = this.getTokenRecords();
    return records.filter(
      (r) => r.timestamp >= startDate && r.timestamp <= endDate
    );
  }

  static getTodayTokenRecords(): TokenRecord[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.getTime();
    const endOfDay = Date.now();
    return this.getTokenRecordsByDateRange(startOfDay, endOfDay);
  }

  static clearTokenRecords(): void {
    store.set('tokenRecords', []);
  }

  // ========== 对话历史 ==========

  static getChatHistory(): ChatMessage[] {
    return store.get('chatHistory', []);
  }

  static addChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    const history = this.getChatHistory();
    const newMessage: ChatMessage = {
      ...message,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    // 只保留最近 500 条消息
    const updatedHistory = [...history, newMessage].slice(-500);
    store.set('chatHistory', updatedHistory);
  }

  static clearChatHistory(): void {
    store.set('chatHistory', []);
  }

  // ========== 统计信息 ==========

  static getStatistics() {
    const records = this.getTokenRecords();
    const todayRecords = this.getTodayTokenRecords();
    const firstRunTime = store.get('firstRunTime', Date.now());

    const totalTokens = records.reduce((sum, r) => sum + r.totalTokens, 0);
    const totalCost = records.reduce((sum, r) => sum + r.estimatedCost, 0);
    const todayTokens = todayRecords.reduce((sum, r) => sum + r.totalTokens, 0);
    const todayCost = todayRecords.reduce((sum, r) => sum + r.estimatedCost, 0);

    return {
      firstRunTime,
      totalDays: Math.floor((Date.now() - firstRunTime) / (1000 * 60 * 60 * 24)),
      totalTasks: records.length,
      totalTokens,
      totalCost,
      todayTasks: todayRecords.length,
      todayTokens,
      todayCost,
      chatMessages: this.getChatHistory().length,
    };
  }

  // ========== 导入导出 ==========

  static exportData() {
    return {
      petState: this.getPetState(),
      settings: this.getSettings(),
      tokenRecords: this.getTokenRecords(),
      chatHistory: this.getChatHistory(),
      exportTime: Date.now(),
    };
  }

  static importData(data: any): boolean {
    try {
      if (data.petState) store.set('petState', data.petState);
      if (data.settings) store.set('settings', data.settings);
      if (data.tokenRecords) store.set('tokenRecords', data.tokenRecords);
      if (data.chatHistory) store.set('chatHistory', data.chatHistory);
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }

  // ========== 重置所有数据 ==========

  static resetAll(): void {
    store.clear();
    store.set('petState', defaultPetState);
    store.set('settings', defaultSettings);
    store.set('tokenRecords', []);
    store.set('chatHistory', []);
    store.set('firstRunTime', Date.now());
  }
}

export default StorageManager;
