/**
 * 全局类型定义
 */

interface ResizeWindowOptions {
  fitToScreen?: boolean;
}

// Electron API 类型定义
interface ElectronAPI {
  // 窗口控制
  minimizeWindow: () => void;
  closeWindow: () => void;
  moveWindow: (x: number, y: number) => void;
  getWindowPosition: () => Promise<[number, number]>;
  getScreenSize: () => Promise<{ width: number; height: number }>;
  setIgnoreMouseEvents: (ignore: boolean) => void;
  resizeWindow: (width: number, height: number, options?: ResizeWindowOptions) => void;

  // 托盘相关
  hideToTray: () => void;
  showFromTray: () => void;
  onNearEdge: (callback: (edge: string) => void) => () => void;
  onOpenChat: (callback: () => void) => () => void;
  onOpenSettings: (callback: () => void) => () => void;

  // AI 对话窗口
  openChatWindow: () => void;
  closeChatWindow: () => void;

  // 环境变量
  env: {
    OPENCLAW_TOKEN?: string;
    OPENCLAW_BASE_URL?: string;
  };

  // Storage API
  storage: {
    // 宠物状态
    getPetState: () => Promise<any>;
    savePetState: (state: any) => void;

    // 设置
    getSettings: () => Promise<any>;
    saveSettings: (settings: any) => void;
    getAISettings: () => Promise<any>;
    saveAISettings: (settings: any) => void;

    // Token 记录
    addTokenRecord: (record: any) => void;
    getTokenRecords: () => Promise<any[]>;
    getTodayTokenRecords: () => Promise<any[]>;

    // 对话历史
    addChatMessage: (message: any) => void;
    getChatHistory: () => Promise<any[]>;
    clearChatHistory: () => void;

    // 统计
    getStatistics: () => Promise<any>;

    // 导入导出
    exportData: () => Promise<any>;
    importData: (data: any) => Promise<boolean>;
    resetAll: () => void;
  };
}

interface Window {
  electronAPI: ElectronAPI;
}
