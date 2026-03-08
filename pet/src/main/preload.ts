import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  moveWindow: (x: number, y: number) => ipcRenderer.send('window:move', { x, y }),
  getWindowPosition: () => ipcRenderer.invoke('window:getPosition'),
  getScreenSize: () => ipcRenderer.invoke('screen:getSize'),

  // 托盘相关
  hideToTray: () => ipcRenderer.send('window:hide-to-tray'),
  showFromTray: () => ipcRenderer.send('window:show-from-tray'),

  // 监听边缘事件
  onNearEdge: (callback: (edge: string) => void) => {
    ipcRenderer.on('window:near-edge', (_, data) => callback(data.edge))
  },

  // AI 对话窗口
  openChatWindow: () => ipcRenderer.send('chat:open'),
  closeChatWindow: () => ipcRenderer.send('chat:close'),

  // 环境变量
  env: {
    OPENCLAW_TOKEN: process.env.OPENCLAW_TOKEN,
    OPENCLAW_BASE_URL: process.env.OPENCLAW_BASE_URL,
  },

  // Storage API
  storage: {
    // 宠物状态
    getPetState: () => ipcRenderer.invoke('storage:getPetState'),
    savePetState: (state: any) => ipcRenderer.send('storage:savePetState', state),

    // 设置
    getSettings: () => ipcRenderer.invoke('storage:getSettings'),
    saveSettings: (settings: any) => ipcRenderer.send('storage:saveSettings', settings),
    getAISettings: () => ipcRenderer.invoke('storage:getAISettings'),
    saveAISettings: (settings: any) => ipcRenderer.send('storage:saveAISettings', settings),

    // Token 记录
    addTokenRecord: (record: any) => ipcRenderer.send('storage:addTokenRecord', record),
    getTokenRecords: () => ipcRenderer.invoke('storage:getTokenRecords'),
    getTodayTokenRecords: () => ipcRenderer.invoke('storage:getTodayTokenRecords'),

    // 对话历史
    addChatMessage: (message: any) => ipcRenderer.send('storage:addChatMessage', message),
    getChatHistory: () => ipcRenderer.invoke('storage:getChatHistory'),
    clearChatHistory: () => ipcRenderer.send('storage:clearChatHistory'),

    // 统计
    getStatistics: () => ipcRenderer.invoke('storage:getStatistics'),

    // 导入导出
    exportData: () => ipcRenderer.invoke('storage:exportData'),
    importData: (data: any) => ipcRenderer.invoke('storage:importData', data),
    resetAll: () => ipcRenderer.send('storage:resetAll'),
  },
})
