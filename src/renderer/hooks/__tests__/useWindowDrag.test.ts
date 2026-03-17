import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useWindowDrag } from '../useWindowDrag'
import { MockElectronAPI } from '../../../../tests/mocks/electronAPI'

describe('useWindowDrag', () => {
  let handleElement: HTMLDivElement
  let mockElectronAPI: MockElectronAPI

  beforeEach(() => {
    handleElement = document.createElement('div')
    handleElement.className = 'pet-draggable-area'
    document.body.appendChild(handleElement)
    mockElectronAPI = window.electronAPI as MockElectronAPI
  })

  afterEach(() => {
    document.body.removeChild(handleElement)
  })

  it('should not trigger drag on button click', () => {
    const button = document.createElement('button')
    handleElement.appendChild(button)

    const ref = { current: handleElement }
    renderHook(() => useWindowDrag(ref, true))

    // Simulate mousedown on button
    const mousedownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      button: 0,
    })
    Object.defineProperty(mousedownEvent, 'target', { value: button })
    button.dispatchEvent(mousedownEvent)

    // Simulate mousemove
    const mousemoveEvent = new MouseEvent('mousemove', {
      bubbles: true,
      screenX: 150,
      screenY: 150,
    })
    window.dispatchEvent(mousemoveEvent)

    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
  })

  it('should not trigger drag on input element', () => {
    const input = document.createElement('input')
    handleElement.appendChild(input)

    const ref = { current: handleElement }
    renderHook(() => useWindowDrag(ref, true))

    // Simulate mousedown on input
    const mousedownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      button: 0,
    })
    Object.defineProperty(mousedownEvent, 'target', { value: input })
    input.dispatchEvent(mousedownEvent)

    // Simulate mousemove
    const mousemoveEvent = new MouseEvent('mousemove', {
      bubbles: true,
      screenX: 150,
      screenY: 150,
    })
    window.dispatchEvent(mousemoveEvent)

    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
  })

  it('should not trigger drag on elements with data-window-drag-ignore', () => {
    const ignoredElement = document.createElement('div')
    ignoredElement.setAttribute('data-window-drag-ignore', 'true')
    handleElement.appendChild(ignoredElement)

    const ref = { current: handleElement }
    renderHook(() => useWindowDrag(ref, true))

    // Simulate mousedown on ignored element
    const mousedownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      button: 0,
    })
    Object.defineProperty(mousedownEvent, 'target', { value: ignoredElement })
    ignoredElement.dispatchEvent(mousedownEvent)

    // Simulate mousemove
    const mousemoveEvent = new MouseEvent('mousemove', {
      bubbles: true,
      screenX: 150,
      screenY: 150,
    })
    window.dispatchEvent(mousemoveEvent)

    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
  })

  it('should trigger moveWindow on draggable area mousedown + mousemove', () => {
    const ref = { current: handleElement }
    renderHook(() => useWindowDrag(ref, true))

    // Simulate mousedown on draggable area
    const mousedownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      button: 0,
      screenX: 100,
      screenY: 100,
    })
    Object.defineProperty(mousedownEvent, 'target', { value: handleElement })
    handleElement.dispatchEvent(mousedownEvent)

    // Simulate mousemove
    const mousemoveEvent = new MouseEvent('mousemove', {
      bubbles: true,
      screenX: 150,
      screenY: 150,
    })
    window.dispatchEvent(mousemoveEvent)

    expect(mockElectronAPI.moveWindow).toHaveBeenCalled()
  })

  it('should stop dragging on mouseup', () => {
    const ref = { current: handleElement }
    renderHook(() => useWindowDrag(ref, true))

    // Start drag
    const mousedownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      button: 0,
      screenX: 100,
      screenY: 100,
    })
    Object.defineProperty(mousedownEvent, 'target', { value: handleElement })
    handleElement.dispatchEvent(mousedownEvent)

    // Stop drag
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

    // Clear previous calls
    vi.clearAllMocks()

    // Try to move after mouseup
    const mousemoveEvent = new MouseEvent('mousemove', {
      bubbles: true,
      screenX: 200,
      screenY: 200,
    })
    window.dispatchEvent(mousemoveEvent)

    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
  })

  it('should stop dragging on window blur', () => {
    const ref = { current: handleElement }
    renderHook(() => useWindowDrag(ref, true))

    // Start drag
    const mousedownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      button: 0,
      screenX: 100,
      screenY: 100,
    })
    Object.defineProperty(mousedownEvent, 'target', { value: handleElement })
    handleElement.dispatchEvent(mousedownEvent)

    // Trigger blur
    window.dispatchEvent(new Event('blur'))

    // Clear previous calls
    vi.clearAllMocks()

    // Try to move after blur
    const mousemoveEvent = new MouseEvent('mousemove', {
      bubbles: true,
      screenX: 200,
      screenY: 200,
    })
    window.dispatchEvent(mousemoveEvent)

    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
  })

  it('should not trigger drag when disabled', () => {
    const ref = { current: handleElement }
    renderHook(() => useWindowDrag(ref, false))

    // Simulate mousedown
    const mousedownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      button: 0,
      screenX: 100,
      screenY: 100,
    })
    Object.defineProperty(mousedownEvent, 'target', { value: handleElement })
    handleElement.dispatchEvent(mousedownEvent)

    // Simulate mousemove
    const mousemoveEvent = new MouseEvent('mousemove', {
      bubbles: true,
      screenX: 150,
      screenY: 150,
    })
    window.dispatchEvent(mousemoveEvent)

    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
  })
})
