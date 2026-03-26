export interface ResizeWindowOptions {
  fitToScreen?: boolean
  offsetX?: number
  offsetY?: number
}

export interface ElectronAPI {
  minimizeWindow: () => void
  closeWindow: () => void
  moveWindow: (x: number, y: number) => void
  getWindowPosition: () => Promise<[number, number]>
  getScreenSize: () => Promise<{ width: number; height: number }>
  setIgnoreMouseEvents: (ignore: boolean) => void
  resizeWindow: (width: number, height: number, options?: ResizeWindowOptions) => void
  hideToTray: () => void
  showFromTray: () => void
  onNearEdge: (callback: (edge: string) => void) => () => void
  onOpenChat: (callback: () => void) => () => void
  onOpenSettings: (callback: () => void) => () => void
  openChatWindow: () => void
  closeChatWindow: () => void
  env: {
    OPENCLAW_TOKEN?: string
    OPENCLAW_BASE_URL?: string
  }
  storage: {
    getPetState: () => Promise<any>
    savePetState: (state: any) => void
    getSettings: () => Promise<any>
    saveSettings: (settings: any) => void
    getAISettings: () => Promise<any>
    saveAISettings: (settings: any) => void
    addTokenRecord: (record: any) => void
    getTokenRecords: () => Promise<any[]>
    getTodayTokenRecords: () => Promise<any[]>
    addChatMessage: (message: any) => void
    getChatHistory: () => Promise<any[]>
    clearChatHistory: () => void
    getStatistics: () => Promise<any>
    exportData: () => Promise<any>
    importData: (data: any) => Promise<boolean>
    resetAll: () => void
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
