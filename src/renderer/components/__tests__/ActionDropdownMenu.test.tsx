import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionDropdownMenu, ActionDropdownMenuItem } from '../ActionDropdownMenu'
import { MockElectronAPI } from '../../../../tests/mocks/electronAPI'

describe('ActionDropdownMenu', () => {
  let mockElectronAPI: MockElectronAPI
  let mockOnClose: ReturnType<typeof vi.fn>

  const defaultItems: ActionDropdownMenuItem[] = [
    { id: 'item1', label: 'Animation 1', icon: '🎬', onSelect: vi.fn() },
    { id: 'item2', label: 'Animation 2', icon: '🎭', onSelect: vi.fn() },
    {
      id: 'category1',
      label: 'Category',
      icon: '📁',
      children: [
        { id: 'sub1', label: 'Sub Animation 1', icon: '🎪', onSelect: vi.fn() },
        { id: 'sub2', label: 'Sub Animation 2', icon: '🎡', onSelect: vi.fn() },
      ],
    },
  ]

  beforeEach(() => {
    mockElectronAPI = window.electronAPI as MockElectronAPI
    mockOnClose = vi.fn()
  })

  it('should not move window when opening dropdown', () => {
    const initialPosition = mockElectronAPI.__getPosition()

    render(
      <ActionDropdownMenu
        items={defaultItems}
        position={{ left: 200, top: 200 }}
        onClose={mockOnClose}
      />
    )

    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
    expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
  })

  it('should stop event propagation on pointerdown', () => {
    render(
      <ActionDropdownMenu
        items={defaultItems}
        position={{ left: 200, top: 200 }}
        onClose={mockOnClose}
      />
    )

    const menu = document.querySelector('.action-dropdown-menu')
    expect(menu).not.toBeNull()

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
      <ActionDropdownMenu
        items={defaultItems}
        position={{ left: 200, top: 200 }}
        onClose={mockOnClose}
      />
    )

    const menu = document.querySelector('.action-dropdown-menu')
    expect(menu).not.toBeNull()

    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    })
    const stopPropagationSpy = vi.spyOn(mouseDownEvent, 'stopPropagation')

    menu!.dispatchEvent(mouseDownEvent)
    expect(stopPropagationSpy).toHaveBeenCalled()
  })

  it('should not trigger moveWindow when selecting an item', async () => {
    const user = userEvent.setup()
    const selectCallback = vi.fn()
    const items: ActionDropdownMenuItem[] = [
      { id: 'test', label: 'Test Animation', icon: '🎬', onSelect: selectCallback },
    ]

    render(
      <ActionDropdownMenu
        items={items}
        position={{ left: 200, top: 200 }}
        onClose={mockOnClose}
      />
    )

    const initialPosition = mockElectronAPI.__getPosition()
    const menuItem = screen.getByText('Test Animation')
    await user.click(menuItem)

    expect(selectCallback).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
    expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
  })

  it('should not trigger moveWindow when hovering over items', async () => {
    const user = userEvent.setup()

    render(
      <ActionDropdownMenu
        items={defaultItems}
        position={{ left: 200, top: 200 }}
        onClose={mockOnClose}
      />
    )

    const initialPosition = mockElectronAPI.__getPosition()

    // Hover over different items
    const item1 = screen.getByText('Animation 1')
    await user.hover(item1)

    const item2 = screen.getByText('Animation 2')
    await user.hover(item2)

    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
    expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
  })

  it('should not trigger moveWindow when expanding submenu', async () => {
    const user = userEvent.setup()

    render(
      <ActionDropdownMenu
        items={defaultItems}
        position={{ left: 200, top: 200 }}
        onClose={mockOnClose}
      />
    )

    const initialPosition = mockElectronAPI.__getPosition()

    // Hover over category to expand submenu
    const categoryItem = screen.getByText('Category')
    await user.hover(categoryItem)

    // Verify submenu is shown
    expect(screen.getByText('Sub Animation 1')).toBeInTheDocument()

    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
    expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
  })

  it('should not trigger moveWindow when selecting submenu item', async () => {
    const user = userEvent.setup()
    const subItemCallback = vi.fn()
    const items: ActionDropdownMenuItem[] = [
      {
        id: 'parent',
        label: 'Parent Category',
        icon: '📁',
        children: [
          { id: 'child', label: 'Child Item', icon: '🎬', onSelect: subItemCallback },
        ],
      },
    ]

    render(
      <ActionDropdownMenu
        items={items}
        position={{ left: 200, top: 200 }}
        onClose={mockOnClose}
      />
    )

    const initialPosition = mockElectronAPI.__getPosition()

    // Expand submenu
    const parentItem = screen.getByText('Parent Category')
    await user.hover(parentItem)

    // Click submenu item
    const childItem = screen.getByText('Child Item')
    await user.click(childItem)

    expect(subItemCallback).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
    expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
  })

  it('should close on Escape key without moving window', async () => {
    render(
      <ActionDropdownMenu
        items={defaultItems}
        position={{ left: 200, top: 200 }}
        onClose={mockOnClose}
      />
    )

    const initialPosition = mockElectronAPI.__getPosition()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(mockOnClose).toHaveBeenCalled()
    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
    expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
  })

  it('should close on clicking outside without moving window', () => {
    render(
      <ActionDropdownMenu
        items={defaultItems}
        position={{ left: 200, top: 200 }}
        onClose={mockOnClose}
      />
    )

    const initialPosition = mockElectronAPI.__getPosition()

    // Click outside (on document)
    fireEvent.pointerDown(document, { bubbles: true })

    expect(mockOnClose).toHaveBeenCalled()
    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
    expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
  })

  it('should not trigger moveWindow when scrolling through items', async () => {
    // Create many items to enable scrolling
    const manyItems: ActionDropdownMenuItem[] = Array.from({ length: 20 }, (_, i) => ({
      id: `item${i}`,
      label: `Animation ${i}`,
      icon: '🎬',
      onSelect: vi.fn(),
    }))

    render(
      <ActionDropdownMenu
        items={manyItems}
        position={{ left: 200, top: 200 }}
        onClose={mockOnClose}
      />
    )

    const initialPosition = mockElectronAPI.__getPosition()
    const menu = document.querySelector('.action-dropdown-menu')

    // Simulate scroll event
    fireEvent.scroll(menu!, { target: { scrollTop: 100 } })

    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
    expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
  })

  it('should prevent context menu event', () => {
    render(
      <ActionDropdownMenu
        items={defaultItems}
        position={{ left: 200, top: 200 }}
        onClose={mockOnClose}
      />
    )

    const menu = document.querySelector('.action-dropdown-menu')
    const contextMenuEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
    })
    const preventDefaultSpy = vi.spyOn(contextMenuEvent, 'preventDefault')

    menu!.dispatchEvent(contextMenuEvent)
    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('should handle disabled items without triggering moveWindow', async () => {
    const user = userEvent.setup()
    const items: ActionDropdownMenuItem[] = [
      { id: 'disabled', label: 'Disabled Item', icon: '🚫', disabled: true, onSelect: vi.fn() },
    ]

    render(
      <ActionDropdownMenu
        items={items}
        position={{ left: 200, top: 200 }}
        onClose={mockOnClose}
      />
    )

    const initialPosition = mockElectronAPI.__getPosition()
    const disabledItem = screen.getByText('Disabled Item')
    await user.click(disabledItem)

    expect(items[0].onSelect).not.toHaveBeenCalled()
    expect(mockOnClose).not.toHaveBeenCalled()
    expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
    expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
  })

  it('should not change menu CSS position when submenu expands', async () => {
    const user = userEvent.setup()

    render(
      <ActionDropdownMenu
        items={defaultItems}
        position={{ left: 200, top: 200 }}
        onClose={mockOnClose}
      />
    )

    const menu = document.querySelector('.action-dropdown-menu') as HTMLElement
    const initialLeft = menu.style.left
    const initialTop = menu.style.top

    // Hover over category to expand submenu
    const categoryItem = screen.getByText('Category')
    await user.hover(categoryItem)

    // Verify submenu is shown
    expect(screen.getByText('Sub Animation 1')).toBeInTheDocument()

    // Verify menu CSS position has not changed
    expect(menu.style.left).toBe(initialLeft)
    expect(menu.style.top).toBe(initialTop)
  })
})
