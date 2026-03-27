import { vi } from 'vitest'

export interface MockElectronAPI {
  moveWindow: ReturnType<typeof vi.fn>
  getWindowPosition: ReturnType<typeof vi.fn>
  resizeWindow: ReturnType<typeof vi.fn>
  setIgnoreMouseEvents: ReturnType<typeof vi.fn>
  hideToTray: ReturnType<typeof vi.fn>
  closeWindow: ReturnType<typeof vi.fn>
  onOpenChat: ReturnType<typeof vi.fn>
  onOpenSettings: ReturnType<typeof vi.fn>
  storage: {
    getSettings: ReturnType<typeof vi.fn>
    getPetState: ReturnType<typeof vi.fn>
    setPetState: ReturnType<typeof vi.fn>
  }
  __getPosition: () => { x: number; y: number }
  __getMoveHistory: () => Array<{ x: number; y: number }>
  __reset: () => void
}

export const createElectronAPIMock = (): MockElectronAPI => {
  let position = { x: 100, y: 100 }
  const moveHistory: Array<{ x: number; y: number }> = []

  return {
    moveWindow: vi.fn((x: number, y: number) => {
      position = { x, y }
      moveHistory.push({ x, y })
    }),
    getWindowPosition: vi.fn(() => Promise.resolve([position.x, position.y])),
    resizeWindow: vi.fn(),
    setIgnoreMouseEvents: vi.fn(),
    hideToTray: vi.fn(),
    closeWindow: vi.fn(),
    onOpenChat: vi.fn(() => () => {}),
    onOpenSettings: vi.fn(() => () => {}),
    storage: {
      getSettings: vi.fn(() => Promise.resolve({
        pet: { animationIntervalMs: 2400 },
      })),
      getPetState: vi.fn(() => Promise.resolve(null)),
      setPetState: vi.fn(() => Promise.resolve()),
    },

    // Test helper methods
    __getPosition: () => ({ ...position }),
    __getMoveHistory: () => [...moveHistory],
    __reset: () => {
      position = { x: 100, y: 100 }
      moveHistory.length = 0
    },
  }
}
