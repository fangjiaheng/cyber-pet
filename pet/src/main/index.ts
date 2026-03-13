import { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import StorageManager from './storage'
import {
  CHAT_WINDOW_HEIGHT,
  CHAT_WINDOW_WIDTH,
  PET_WINDOW_HEIGHT,
  PET_WINDOW_WIDTH,
} from '../shared/windowSizes'

let mainWindow: BrowserWindow | null = null
let chatWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isWindowHidden = false
const minVisiblePixels = 50

function clampWindowPosition(x: number, y: number, windowWidth: number, windowHeight: number) {
  const display = screen.getDisplayNearestPoint({
    x: Math.round(x + windowWidth / 2),
    y: Math.round(y + windowHeight / 2),
  })
  const workArea = display.workArea

  const maxX = workArea.x + workArea.width - minVisiblePixels
  const maxY = workArea.y + workArea.height - minVisiblePixels
  const minX = workArea.x + minVisiblePixels - windowWidth
  const minY = workArea.y + minVisiblePixels - windowHeight

  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
    workArea,
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: PET_WINDOW_WIDTH,
    height: PET_WINDOW_HEIGHT,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    x: 100,  // 固定位置，方便找到
    y: 100,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../main/preload.js'),
    },
  })

  // 开发环境加载 Vite 服务器
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // 生产环境加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()
  createTray()

  // 监听窗口移动请求（带边界检测和自动隐藏）
  ipcMain.on('window:move', (_, { x, y }) => {
    if (mainWindow) {
      const [windowWidth, windowHeight] = mainWindow.getSize()
      const { x: boundedX, y: boundedY, workArea } = clampWindowPosition(x, y, windowWidth, windowHeight)

      mainWindow.setPosition(boundedX, boundedY)

      // 检测是否靠近屏幕边缘（30 像素以内）
      const edgeThreshold = 30
      const isNearLeftEdge = boundedX - workArea.x < edgeThreshold
      const isNearRightEdge = workArea.x + workArea.width - (boundedX + windowWidth) < edgeThreshold
      const isNearTopEdge = boundedY - workArea.y < edgeThreshold
      const isNearBottomEdge = workArea.y + workArea.height - (boundedY + windowHeight) < edgeThreshold

      if (isNearLeftEdge || isNearRightEdge || isNearTopEdge || isNearBottomEdge) {
        // 靠近边缘，通知渲染进程
        mainWindow.webContents.send('window:near-edge', {
          edge: isNearLeftEdge ? 'left' : isNearRightEdge ? 'right' : isNearTopEdge ? 'top' : 'bottom'
        })
      }
    }
  })

  // 监听获取窗口位置
  ipcMain.handle('window:getPosition', () => {
    if (mainWindow) {
      return mainWindow.getPosition()
    }
    return [0, 0]
  })

  // 监听最小化窗口
  ipcMain.on('window:minimize', () => {
    if (mainWindow) {
      mainWindow.minimize()
    }
  })

  // 监听关闭窗口
  ipcMain.on('window:close', () => {
    if (mainWindow) {
      mainWindow.close()
    }
  })

  // 监听隐藏窗口到托盘
  ipcMain.on('window:hide-to-tray', () => {
    if (mainWindow) {
      mainWindow.hide()
      isWindowHidden = true
      console.log('🙈 窗口已隐藏到托盘')
    }
  })

  // 监听从托盘恢复窗口
  ipcMain.on('window:show-from-tray', () => {
    if (mainWindow) {
      mainWindow.show()
      isWindowHidden = false
      console.log('👀 窗口已从托盘恢复')
    }
  })

  // 监听设置鼠标穿透
  ipcMain.on('window:set-ignore-mouse-events', (_, ignore: boolean) => {
    if (mainWindow) {
      if (ignore) {
        // 忽略鼠标事件，让点击穿透
        mainWindow.setIgnoreMouseEvents(true, { forward: true })
      } else {
        // 正常接收鼠标事件
        mainWindow.setIgnoreMouseEvents(false)
      }
    }
  })

  // 监听调整窗口大小
  ipcMain.on('window:resize', (_, { width, height }) => {
    if (mainWindow) {
      const [currentX, currentY] = mainWindow.getPosition()
      mainWindow.setSize(width, height)

      const { x: boundedX, y: boundedY } = clampWindowPosition(currentX, currentY, width, height)
      mainWindow.setPosition(boundedX, boundedY)
    }
  })

  // 获取屏幕尺寸（用于边界检测）
  ipcMain.handle('screen:getSize', () => {
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    return { width, height }
  })

  // 打开 AI 对话窗口
  ipcMain.on('chat:open', () => {
    console.log('📞 收到打开对话窗口的请求')
    createChatWindow()
  })

  // 关闭 AI 对话窗口
  ipcMain.on('chat:close', () => {
    if (chatWindow && !chatWindow.isDestroyed()) {
      chatWindow.close()
    }
  })

  // ========== Storage API ==========

  // 获取宠物状态
  ipcMain.handle('storage:getPetState', () => {
    return StorageManager.getPetState()
  })

  // 保存宠物状态
  ipcMain.on('storage:savePetState', (_, state) => {
    StorageManager.savePetState(state)
  })

  // 获取设置
  ipcMain.handle('storage:getSettings', () => {
    return StorageManager.getSettings()
  })

  // 保存设置
  ipcMain.on('storage:saveSettings', (_, settings) => {
    StorageManager.saveSettings(settings)
  })

  // 获取 AI 设置
  ipcMain.handle('storage:getAISettings', () => {
    return StorageManager.getAISettings()
  })

  // 保存 AI 设置
  ipcMain.on('storage:saveAISettings', (_, settings) => {
    StorageManager.saveAISettings(settings)
  })

  // 添加 Token 记录
  ipcMain.on('storage:addTokenRecord', (_, record) => {
    StorageManager.addTokenRecord(record)
  })

  // 获取 Token 记录
  ipcMain.handle('storage:getTokenRecords', () => {
    return StorageManager.getTokenRecords()
  })

  // 获取今日 Token 记录
  ipcMain.handle('storage:getTodayTokenRecords', () => {
    return StorageManager.getTodayTokenRecords()
  })

  // 添加对话消息
  ipcMain.on('storage:addChatMessage', (_, message) => {
    StorageManager.addChatMessage(message)
  })

  // 获取对话历史
  ipcMain.handle('storage:getChatHistory', () => {
    return StorageManager.getChatHistory()
  })

  // 清空对话历史
  ipcMain.on('storage:clearChatHistory', () => {
    StorageManager.clearChatHistory()
  })

  // 获取统计信息
  ipcMain.handle('storage:getStatistics', () => {
    return StorageManager.getStatistics()
  })

  // 导出数据
  ipcMain.handle('storage:exportData', () => {
    return StorageManager.exportData()
  })

  // 导入数据
  ipcMain.handle('storage:importData', (_, data) => {
    return StorageManager.importData(data)
  })

  // 重置所有数据
  ipcMain.on('storage:resetAll', () => {
    StorageManager.resetAll()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 创建系统托盘
function createTray() {
  // 创建一个简单的托盘图标（使用 emoji）
  // 在实际项目中应该使用 PNG 图标
  const icon = nativeImage.createEmpty()

  // macOS 使用 Template 图标
  if (process.platform === 'darwin') {
    // 创建一个简单的图标（16x16 黑色方块）
    const size = 16
    const canvas = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="14" font-size="14">🦞</text>
      </svg>
    `
    const image = nativeImage.createFromDataURL(`data:image/svg+xml;base64,${Buffer.from(canvas).toString('base64')}`)
    tray = new Tray(image)
  } else {
    // Windows/Linux 使用普通图标
    tray = new Tray(icon)
  }

  // 设置托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示宠物',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          isWindowHidden = false
        } else {
          createWindow()
        }
      }
    },
    {
      label: '打开 AI 助手',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.webContents.send('open-chat')
        }
      }
    },
    { type: 'separator' },
    {
      label: 'AI 助手配置',
      click: () => {
        // TODO: 打开设置面板
        if (mainWindow) {
          mainWindow.show()
          mainWindow.webContents.send('open-settings')
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
  tray.setToolTip('桌面宠物 - Cyber Mate 🦞')

  // 点击托盘图标时显示/隐藏窗口
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
        isWindowHidden = true
      } else {
        mainWindow.show()
        isWindowHidden = false
      }
    }
  })

  console.log('✅ 系统托盘已创建')
}

// 创建 AI 对话窗口
function createChatWindow() {
  console.log('🚀 开始创建对话窗口...')

  // 如果已经打开，就聚焦
  if (chatWindow && !chatWindow.isDestroyed()) {
    console.log('✅ 窗口已存在，聚焦')
    chatWindow.focus()
    return
  }

  console.log('📦 创建新窗口...')
  chatWindow = new BrowserWindow({
    width: CHAT_WINDOW_WIDTH,
    height: CHAT_WINDOW_HEIGHT,
    minWidth: 400,
    minHeight: 500,
    x: 100,  // 固定位置，确保在屏幕内
    y: 100,
    title: 'AI 助手 🦞',
    backgroundColor: '#667eea',
    show: false,  // 先不显示，等加载完再显示
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../main/preload.js'),
    },
  })

  // 窗口准备好后显示
  chatWindow.once('ready-to-show', () => {
    console.log('✅ 窗口准备就绪，显示窗口')
    chatWindow?.show()
  })

  // 开发环境加载 Vite 服务器
  if (process.env.NODE_ENV === 'development') {
    // 使用调试版本
    const url = 'http://localhost:5173/chat-debug.html'
    console.log('🌐 加载 URL:', url)
    chatWindow.loadURL(url).then(() => {
      console.log('✅ URL 加载成功')
      chatWindow?.webContents.openDevTools()
    }).catch((err) => {
      console.error('❌ URL 加载失败:', err)
    })
  } else {
    // 生产环境加载打包后的文件
    const filePath = path.join(__dirname, '../renderer/chat.html')
    console.log('📄 加载文件:', filePath)
    chatWindow.loadFile(filePath)
  }

  chatWindow.on('closed', () => {
    console.log('🔒 窗口已关闭')
    chatWindow = null
  })

  // 监听加载错误
  chatWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ 页面加载失败:', errorCode, errorDescription)
  })
}
