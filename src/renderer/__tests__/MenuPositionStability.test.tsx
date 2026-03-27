import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContextMenu, MenuItem } from '../components/ContextMenu'
import { ActionDropdownMenu, ActionDropdownMenuItem } from '../components/ActionDropdownMenu'
import { MockElectronAPI } from '../../../tests/mocks/electronAPI'

describe('Menu Position Stability Integration Tests', () => {
  let mockElectronAPI: MockElectronAPI

  beforeEach(() => {
    mockElectronAPI = window.electronAPI as MockElectronAPI
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Right-Click Menu Lifecycle', () => {
    it('should maintain position through open → interact → close lifecycle', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const mockOnClose = vi.fn()
      const itemCallback = vi.fn()
      const items: MenuItem[] = [
        { label: 'Action 1', onClick: itemCallback },
        { label: 'Action 2', onClick: vi.fn() },
        {
          label: 'Submenu',
          onClick: vi.fn(),
          children: [
            { label: 'Sub Action 1', onClick: vi.fn() },
            { label: 'Sub Action 2', onClick: vi.fn() },
          ],
        },
      ]

      const initialPosition = mockElectronAPI.__getPosition()

      // Open menu
      const { rerender } = render(
        <ContextMenu
          x={100}
          y={100}
          items={items}
          onClose={mockOnClose}
        />
      )

      // Verify position unchanged after opening
      expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
      expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()

      // Hover over items
      const action1 = screen.getByText('Action 1')
      await user.hover(action1)

      const action2 = screen.getByText('Action 2')
      await user.hover(action2)

      // Expand submenu
      const submenu = screen.getByText('Submenu')
      await user.hover(submenu)

      // Wait for submenu to appear
      await waitFor(() => {
        expect(screen.getByText('Sub Action 1')).toBeInTheDocument()
      })

      // Verify position still unchanged
      expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
      expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()

      // Click an item
      await user.click(action1)

      // Verify callback was called and position unchanged
      expect(itemCallback).toHaveBeenCalled()
      expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
      expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
    })
  })

  describe('Action Dropdown Menu Tests', () => {
    it('should maintain position when clicking animation button → expand → select', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const mockOnClose = vi.fn()
      const selectCallback = vi.fn()
      const items: ActionDropdownMenuItem[] = [
        {
          id: 'category1',
          label: 'Animations',
          icon: '🎬',
          children: [
            { id: 'anim1', label: 'Wave', icon: '👋', onSelect: selectCallback },
            { id: 'anim2', label: 'Dance', icon: '💃', onSelect: vi.fn() },
          ],
        },
        {
          id: 'category2',
          label: 'Actions',
          icon: '🎮',
          children: [
            { id: 'action1', label: 'Jump', icon: '🦘', onSelect: vi.fn() },
          ],
        },
      ]

      const initialPosition = mockElectronAPI.__getPosition()

      render(
        <ActionDropdownMenu
          items={items}
          position={{ left: 200, top: 150 }}
          onClose={mockOnClose}
        />
      )

      // Expand category
      const category = screen.getByText('Animations')
      await user.hover(category)

      // Wait for children to appear
      await waitFor(() => {
        expect(screen.getByText('Wave')).toBeInTheDocument()
      })

      // Verify position unchanged
      expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)

      // Select animation
      const waveItem = screen.getByText('Wave')
      await user.click(waveItem)

      // Verify callback was called and position unchanged
      expect(selectCallback).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
      expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
      expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
    })
  })

  describe('Repeated Open/Close Tests', () => {
    it('should maintain position after opening and closing menu 10 times', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const initialPosition = mockElectronAPI.__getPosition()
      let closeCallback: ReturnType<typeof vi.fn>
      const items: MenuItem[] = [
        { label: 'Test Item', onClick: vi.fn() },
      ]

      for (let i = 0; i < 10; i++) {
        closeCallback = vi.fn()

        // Open menu
        const { unmount } = render(
          <ContextMenu
            x={100 + i}
            y={100 + i}
            items={items}
            onClose={closeCallback}
          />
        )

        // Interact with menu
        const menuItem = screen.getByText('Test Item')
        await user.hover(menuItem)

        // Close menu
        fireEvent.keyDown(document, { key: 'Escape' })

        // Cleanup
        unmount()

        // Verify position unchanged after each iteration
        expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
      }

      // Final verification
      expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
      expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
    })

    it('should maintain position after opening and closing dropdown 10 times', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const initialPosition = mockElectronAPI.__getPosition()
      const items: ActionDropdownMenuItem[] = [
        {
          id: 'test',
          label: 'Test Category',
          icon: '🎬',
          children: [
            { id: 'sub', label: 'Sub Item', icon: '✨', onSelect: vi.fn() },
          ],
        },
      ]

      for (let i = 0; i < 10; i++) {
        const closeCallback = vi.fn()

        const { unmount } = render(
          <ActionDropdownMenu
            items={items}
            position={{ left: 200, top: 200 }}
            onClose={closeCallback}
          />
        )

        // Hover to expand
        const category = screen.getByText('Test Category')
        await user.hover(category)

        // Close
        fireEvent.keyDown(document, { key: 'Escape' })

        unmount()

        expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
      }

      expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
    })
  })

  describe('Submenu Hover Tests', () => {
    it('should not trigger mouse gaze logic when hovering over multi-level menus', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const mockOnClose = vi.fn()
      const items: MenuItem[] = [
        {
          label: 'Level 1',
          onClick: vi.fn(),
          children: [
            { label: 'Level 2 Item 1', onClick: vi.fn() },
            { label: 'Level 2 Item 2', onClick: vi.fn() },
          ],
        },
        {
          label: 'Another Menu',
          onClick: vi.fn(),
          children: [
            { label: 'Another Sub 1', onClick: vi.fn() },
            { label: 'Another Sub 2', onClick: vi.fn() },
          ],
        },
      ]

      const initialPosition = mockElectronAPI.__getPosition()

      render(
        <ContextMenu
          x={100}
          y={100}
          items={items}
          onClose={mockOnClose}
        />
      )

      // Hover over first menu item
      const level1 = screen.getByText('Level 1')
      await user.hover(level1)

      // Wait for submenu
      await waitFor(() => {
        expect(screen.getByText('Level 2 Item 1')).toBeInTheDocument()
      })

      // Hover over submenu items
      await user.hover(screen.getByText('Level 2 Item 1'))
      await user.hover(screen.getByText('Level 2 Item 2'))

      // Move to another menu
      const anotherMenu = screen.getByText('Another Menu')
      await user.hover(anotherMenu)

      await waitFor(() => {
        expect(screen.getByText('Another Sub 1')).toBeInTheDocument()
      })

      // Hover submenu items
      await user.hover(screen.getByText('Another Sub 1'))
      await user.hover(screen.getByText('Another Sub 2'))

      // Verify no position change throughout
      expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
      expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
    })
  })

  describe('Event Propagation Tests', () => {
    it('should prevent drag initiation from menu interactions', () => {
      const mockOnClose = vi.fn()
      const items: MenuItem[] = [
        { label: 'Test', onClick: vi.fn() },
      ]

      render(
        <ContextMenu
          x={100}
          y={100}
          items={items}
          onClose={mockOnClose}
        />
      )

      const menu = document.querySelector('.context-menu')!
      const initialPosition = mockElectronAPI.__getPosition()

      // Simulate drag sequence on menu
      fireEvent.mouseDown(menu, { button: 0, screenX: 100, screenY: 100 })
      fireEvent.mouseMove(window, { screenX: 200, screenY: 200 })
      fireEvent.mouseUp(window)

      // moveWindow should not be called
      expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
      expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
    })

    it('should prevent drag initiation from dropdown menu interactions', () => {
      const mockOnClose = vi.fn()
      const items: ActionDropdownMenuItem[] = [
        { id: 'test', label: 'Test', icon: '🎬', onSelect: vi.fn() },
      ]

      render(
        <ActionDropdownMenu
          items={items}
          position={{ left: 200, top: 200 }}
          onClose={mockOnClose}
        />
      )

      const menu = document.querySelector('.action-dropdown-menu')!
      const initialPosition = mockElectronAPI.__getPosition()

      // Simulate drag sequence on menu
      fireEvent.mouseDown(menu, { button: 0, screenX: 200, screenY: 200 })
      fireEvent.mouseMove(window, { screenX: 300, screenY: 300 })
      fireEvent.mouseUp(window)

      // moveWindow should not be called
      expect(mockElectronAPI.moveWindow).not.toHaveBeenCalled()
      expect(mockElectronAPI.__getPosition()).toEqual(initialPosition)
    })
  })

  describe('Position Stability Verification', () => {
    it('should verify moveWindow call history is empty during menu operations', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const mockOnClose = vi.fn()
      const items: MenuItem[] = [
        { label: 'Item 1', onClick: vi.fn() },
        { label: 'Item 2', onClick: vi.fn() },
        {
          label: 'Submenu',
          onClick: vi.fn(),
          children: [
            { label: 'Sub 1', onClick: vi.fn() },
            { label: 'Sub 2', onClick: vi.fn() },
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

      // Perform various interactions
      await user.hover(screen.getByText('Item 1'))
      await user.hover(screen.getByText('Item 2'))
      await user.hover(screen.getByText('Submenu'))

      await waitFor(() => {
        expect(screen.getByText('Sub 1')).toBeInTheDocument()
      })

      await user.hover(screen.getByText('Sub 1'))
      await user.click(screen.getByText('Sub 2'))

      // Verify move history is empty
      expect(mockElectronAPI.__getMoveHistory()).toHaveLength(0)
    })

    it('should verify initial and final positions are identical', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const mockOnClose = vi.fn()
      const itemCallback = vi.fn()
      const items: ActionDropdownMenuItem[] = [
        {
          id: 'cat',
          label: 'Category',
          icon: '📁',
          children: [
            { id: 'item', label: 'Action', icon: '⚡', onSelect: itemCallback },
          ],
        },
      ]

      const initialPosition = mockElectronAPI.__getPosition()

      render(
        <ActionDropdownMenu
          items={items}
          position={{ left: 200, top: 200 }}
          onClose={mockOnClose}
        />
      )

      // Expand and select
      await user.hover(screen.getByText('Category'))
      await waitFor(() => {
        expect(screen.getByText('Action')).toBeInTheDocument()
      })
      await user.click(screen.getByText('Action'))

      const finalPosition = mockElectronAPI.__getPosition()

      expect(finalPosition).toEqual(initialPosition)
      expect(itemCallback).toHaveBeenCalled()
    })
  })
})
