import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContextMenu, MenuItem } from '../ContextMenu'
import { MockElectronAPI } from '../../../../tests/mocks/electronAPI'

describe('ContextMenu', () => {
  let mockElectronAPI: MockElectronAPI
  let mockOnClose: ReturnType<typeof vi.fn>
  let mockOnClick: ReturnType<typeof vi.fn>

  const defaultItems: MenuItem[] = [
    { label: 'Item 1', onClick: vi.fn() },
    { label: 'Item 2', onClick: vi.fn() },
    { label: 'Item with children', onClick: vi.fn(), children: [
      { label: 'Sub Item 1', onClick: vi.fn() },
      { label: 'Sub Item 2', onClick: vi.fn() },
    ] },
  ]

  beforeEach(() => {
    mockElectronAPI = window.electronAPI as MockElectronAPI
    mockOnClose = vi.fn()
    mockOnClick = vi.fn()
  })

  it('should stop event propagation on pointerdown', () => {
    render(
      <ContextMenu
        x={100}
        y={100}
        items={defaultItems}
        onClose={mockOnClose}
      />
    )

    const menu = document.querySelector('.context-menu')
    expect(menu).not.toBeNull()

    // Create a pointerdown event and check stopPropagation was called
    const pointerDownEvent = new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
    })
    const stopPropagationSpy = vi.spyOn(pointerDownEvent, 'stopPropagation')

    menu!.dispatchEvent(pointerDownEvent)
    expect(stopPropagationSpy).toHaveBeenCalled()
  })

  it('should stop event propagation on mousedown', () => {
    render(
      <ContextMenu
        x={100}
        y={100}
        items={defaultItems}
        onClose={mockOnClose}
      />
    )

    const menu = document.querySelector('.context-menu')
    expect(menu).not.toBeNull()

    // Create a mousedown event and check stopPropagation was called
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    })
    const stopPropagationSpy = vi.spyOn(mouseDownEvent, 'stopPropagation')

    menu!.dispatchEvent(mouseDownEvent)
    expect(stopPropagationSpy).toHaveBeenCalled()
  })

  it('should not trigger moveWindow when clicking menu items', async () => {
    const user = userEvent.setup()
    const itemClickHandler = vi.fn()
    const items: MenuItem[] = [
      { label: 'Test Item', onClick: itemClickHandler },
    ]

    render(
      <ContextMenu
        x={100}
        y={100}
        items={items}
        onClose={mockOnClose}
      />
    )

    const menuItem = screen.getByText('Test Item')
    await user.click(menuItem)

    expect(itemClickHandler).toHaveBeenCalled()
    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
  })

  it('should not trigger position change when expanding submenu', async () => {
    const user = userEvent.setup()
    const initialPosition = mockElectronAPI.__getPosition()

    render(
      <ContextMenu
        x={100}
        y={100}
        items={defaultItems}
        onClose={mockOnClose}
      />
    )

    // Hover over item with children
    const parentItem = screen.getByText('Item with children')
    await user.hover(parentItem)

    // Check that submenu appears
    expect(screen.getByText('Sub Item 1')).toBeInTheDocument()

    // Verify window position unchanged
    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
    expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
  })

  it('should only call onClick callback without moving window when clicking menu item', async () => {
    const user = userEvent.setup()
    const itemCallback = vi.fn()
    const items: MenuItem[] = [
      { label: 'Action Item', onClick: itemCallback },
    ]

    render(
      <ContextMenu
        x={100}
        y={100}
        items={items}
        onClose={mockOnClose}
      />
    )

    const initialPosition = mockElectronAPI.__getPosition()
    const menuItem = screen.getByText('Action Item')
    await user.click(menuItem)

    expect(itemCallback).toHaveBeenCalledTimes(1)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
    expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
  })

  it('should not trigger drag when clicking submenu items', async () => {
    const user = userEvent.setup()
    const subItemCallback = vi.fn()
    const items: MenuItem[] = [
      {
        label: 'Parent',
        onClick: vi.fn(),
        children: [
          { label: 'Sub Action', onClick: subItemCallback },
        ],
      },
    ]

    render(
      <ContextMenu
        x={100}
        y={100}
        items={items}
        onClose={mockOnClose}
      />
    )

    const initialPosition = mockElectronAPI.__getPosition()

    // Hover to open submenu
    const parentItem = screen.getByText('Parent')
    await user.hover(parentItem)

    // Click submenu item
    const subItem = screen.getByText('Sub Action')
    await user.click(subItem)

    expect(subItemCallback).toHaveBeenCalledTimes(1)
    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
    expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
  })

  it('should close menu on Escape key', async () => {
    render(
      <ContextMenu
        x={100}
        y={100}
        items={defaultItems}
        onClose={mockOnClose}
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(mockOnClose).toHaveBeenCalled()
    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
  })

  it('should close menu on clicking outside', () => {
    render(
      <ContextMenu
        x={100}
        y={100}
        items={defaultItems}
        onClose={mockOnClose}
      />
    )

    // Click on overlay (outside menu)
    const overlay = document.querySelector('.context-menu-overlay')
    fireEvent.pointerDown(overlay!)

    expect(mockOnClose).toHaveBeenCalled()
    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
  })

  it('should prevent context menu event', () => {
    render(
      <ContextMenu
        x={100}
        y={100}
        items={defaultItems}
        onClose={mockOnClose}
      />
    )

    const overlay = document.querySelector('.context-menu-overlay')
    const contextMenuEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
    })
    const preventDefaultSpy = vi.spyOn(contextMenuEvent, 'preventDefault')

    overlay!.dispatchEvent(contextMenuEvent)
    expect(preventDefaultSpy).toHaveBeenCalled()
  })
})
