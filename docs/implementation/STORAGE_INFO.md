# 📦 数据存储说明

## 存储位置

### macOS（你的系统）

**开发环境：**
```
~/Library/Application Support/Electron/config.json
```

**生产环境（打包后）：**
```
~/Library/Application Support/desktop-pet/config.json
```

### Windows

**开发环境：**
```
%APPDATA%\Electron\config.json
```

**生产环境：**
```
%APPDATA%\desktop-pet\config.json
```

### Linux

**开发环境：**
```
~/.config/Electron/config.json
```

**生产环境：**
```
~/.config/desktop-pet/config.json
```

---

## 存储内容

### 数据结构

```json
{
  "petState": {
    "hunger": 80,
    "cleanliness": 80,
    "mood": 80,
    "energy": 80,
    "level": 1,
    "experience": 0,
    "lastUpdateTime": 1709708400000
  },
  "settings": {
    "ai": {
      "provider": "claude",
      "apiKey": "cr_...",
      "defaultModel": "claude-opus-4-5-20251101"
    },
    "pet": {
      "name": "Q宠宝贝",
      "skin": "default",
      "roamingEnabled": false,
      "roamingSpeed": 1
    },
    "notifications": {
      "enabled": true,
      "hungerThreshold": 30,
      "cleanlinessThreshold": 30
    },
    "window": {
      "alwaysOnTop": true,
      "startWithSystem": false
    }
  },
  "tokenRecords": [
    {
      "id": "1709708400000-abc123",
      "provider": "claude",
      "taskType": "chat",
      "inputTokens": 10,
      "outputTokens": 245,
      "totalTokens": 255,
      "estimatedCost": 0.018375,
      "timestamp": 1709708400000
    }
  ],
  "chatHistory": [
    {
      "id": "1709708400000-xyz789",
      "role": "user",
      "content": "你好",
      "timestamp": 1709708400000
    }
  ],
  "firstRunTime": 1709708400000
}
```

---

## 查看存储数据

### 方法 1：命令行查看（macOS/Linux）

```bash
# 查看文件内容
cat ~/Library/Application\ Support/Electron/config.json

# 格式化输出
cat ~/Library/Application\ Support/Electron/config.json | python -m json.tool

# 使用 jq（如果安装了）
cat ~/Library/Application\ Support/Electron/config.json | jq '.'
```

### 方法 2：在应用中查看

在右键菜单中添加"查看数据"选项，打开 StorageViewer 组件。

### 方法 3：使用 Finder（macOS）

1. 打开 Finder
2. 按 `Cmd + Shift + G`
3. 输入：`~/Library/Application Support/Electron`
4. 双击 `config.json` 用文本编辑器打开

---

## 数据管理

### 自动保存

- **宠物状态**：每次状态改变后 1 秒自动保存（防抖）
- **Token 记录**：每次 AI 调用后立即保存
- **对话历史**：每条消息立即保存（下一步集成）
- **设置**：修改后立即保存

### 数据限制

- **Token 记录**：最多保留 1000 条
- **对话历史**：最多保留 500 条
- **自动清理**：超出限制时自动删除最旧的记录

### 导出数据

```typescript
// 在应用中
const data = await window.electronAPI.storage.exportData();
console.log(data);

// 下载 JSON 文件
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
// ... 下载逻辑
```

### 导入数据

```typescript
const imported = await window.electronAPI.storage.importData(data);
if (imported) {
  console.log('导入成功');
}
```

### 重置所有数据

```typescript
window.electronAPI.storage.resetAll();
```

---

## 安全性

### 加密

- 使用 **AES-256-GCM** 加密
- 加密密钥：`cyber-mate-pet-2026`
- API Key 等敏感信息被加密存储

### 隐私

- **所有数据仅保存在本地**
- 不上传到任何服务器
- 对话内容不会离开你的设备（除了调用 AI API）

---

## 故障排除

### 数据丢失

如果数据丢失：

1. 检查存储文件是否存在
2. 检查文件权限
3. 查看控制台错误日志
4. 从备份恢复（如果有导出）

### 数据损坏

如果数据损坏无法加载：

```bash
# 备份损坏的文件
mv ~/Library/Application\ Support/Electron/config.json ~/Desktop/config.json.bak

# 重启应用，会自动创建新文件
```

### 清空重置

```bash
# 删除所有数据
rm -rf ~/Library/Application\ Support/Electron/

# 或在应用中使用重置功能
```

---

## 开发调试

### 查看实时日志

打开开发者工具查看存储操作日志：

```javascript
// 控制台会显示
✅ 宠物状态已从存储恢复
✅ 宠物状态已保存
```

### 手动测试

```javascript
// 在控制台执行
await window.electronAPI.storage.getPetState()
await window.electronAPI.storage.getStatistics()
await window.electronAPI.storage.getTokenRecords()
```

---

## 下一步

- [ ] 在设置面板中添加数据管理功能
- [ ] 集成对话历史保存到 ChatWindow
- [ ] 添加自动备份功能
- [ ] 云端同步（可选）
