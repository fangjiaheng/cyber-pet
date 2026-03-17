import { beforeEach, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { createElectronAPIMock, MockElectronAPI } from './mocks/electronAPI'

declare global {
  interface Window {
    electronAPI: MockElectronAPI
  }
}

let mockElectronAPI: MockElectronAPI

beforeEach(() => {
  mockElectronAPI = createElectronAPIMock()
  window.electronAPI = mockElectronAPI

  // Reset all mocks before each test
  vi.clearAllMocks()
  mockElectronAPI.__reset()
})

// Mock ResizeObserver which is not available in happy-dom
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(() => callback(Date.now()), 0) as unknown as number
}

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id)
}

// Mock window.screenX and window.screenY
Object.defineProperty(window, 'screenX', { value: 100, writable: true })
Object.defineProperty(window, 'screenY', { value: 100, writable: true })
