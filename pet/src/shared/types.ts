export interface ElectronAPI {
  minimizeWindow: () => void
  closeWindow: () => void
  moveWindow: (x: number, y: number) => void
  getWindowPosition: () => Promise<[number, number]>
  getScreenSize: () => Promise<{ width: number; height: number }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
