# 🔧 Ruffle 加载问题修复指南

## ✅ 已修复的问题

我已经修改了 `RufflePlayer.tsx`，现在使用 **CDN 方式**加载 Ruffle。

## 🚀 现在测试一下

重启项目：
```bash
npm run dev
```

然后尝试打开动画画廊，应该可以正常加载了！

---

## 如果还有问题 - 方案 A：使用本地 Ruffle（推荐）

### 步骤 1：复制 Ruffle 文件

从之前下载的仓库复制：
```bash
mkdir -p public/ruffle
cp /tmp/qqpet-web/Ruffle/ruffle.js public/ruffle/
```

### 步骤 2：修改 RufflePlayer.tsx

编辑 `src/renderer/components/RufflePlayer.tsx`，找到：
```typescript
script.src = 'https://unpkg.com/@ruffle-rs/ruffle@latest'
```

改为：
```typescript
script.src = '/ruffle/ruffle.js'
```

### 步骤 3：重启项目
```bash
npm run dev
```

---

## 如果还有问题 - 方案 B：手动下载 Ruffle

### 步骤 1：下载 Ruffle

访问：https://github.com/ruffle-rs/ruffle/releases

或使用命令：
```bash
# 创建目录
mkdir -p public/ruffle

# 下载最新版本
curl -L https://unpkg.com/@ruffle-rs/ruffle@latest/ruffle.js -o public/ruffle/ruffle.js
```

### 步骤 2：修改加载路径

按照方案 A 的步骤 2 操作。

---

## 如果还有问题 - 方案 C：使用 npm 包（当前方案的备选）

### 步骤 1：确认包已安装
```bash
npm list @ruffle-rs/ruffle
```

应该显示：`@ruffle-rs/ruffle@<version>`

### 步骤 2：重新安装（如果需要）
```bash
npm uninstall @ruffle-rs/ruffle
npm install @ruffle-rs/ruffle@latest
```

### 步骤 3：清除缓存并重启
```bash
rm -rf node_modules/.vite
npm run dev
```

---

## 验证 Ruffle 是否正常工作

### 方法 1：检查浏览器控制台

1. 启动项目：`npm run dev`
2. 打开浏览器开发者工具（F12）
3. 打开动画画廊（鼠标移到企鹅上 → 点击 🎬）
4. 查看 Console 标签页：
   - ✅ **没有错误** → Ruffle 正常工作
   - ❌ **有 Ruffle 相关错误** → 继续排查

### 方法 2：测试播放

1. 打开动画画廊
2. 选择 "常规动作"
3. 点击 "动作1"
4. 看底部播放器：
   - ✅ **显示动画** → 完美！
   - ❌ **显示"加载中..."** → Ruffle 未加载
   - ❌ **显示错误** → 查看错误信息

---

## 常见错误及解决方案

### 错误 1: "Cannot read properties of undefined (reading 'newest')"

**原因**：Ruffle 未正确加载

**解决**：
- 使用方案 A（本地 Ruffle 文件）
- 或检查网络连接（CDN 可能被墙）

### 错误 2: "Failed to load Ruffle"

**原因**：CDN 无法访问

**解决**：
```bash
# 使用本地文件
cp /tmp/qqpet-web/Ruffle/ruffle.js public/ruffle/
```

然后修改代码使用本地路径（方案 A）

### 错误 3: "RufflePlayer is not defined"

**原因**：Ruffle 脚本加载超时

**解决**：增加等待时间

编辑 `RufflePlayer.tsx`，找到：
```typescript
await new Promise(resolve => setTimeout(resolve, 100))
```

改为：
```typescript
await new Promise(resolve => setTimeout(resolve, 500))
```

### 错误 4: SWF 文件 404 Not Found

**原因**：SWF 文件路径不正确

**解决**：
```bash
# 检查文件是否存在
ls public/assets/swf_original/GG/chang/1.swf

# 如果不存在，重新复制
cp -r /tmp/qqpet-web/Penguin/GG public/assets/swf_original/
```

---

## 快速修复脚本

如果懒得一步步操作，运行这个脚本：

**fix_ruffle.sh**:
```bash
#!/bin/bash

echo "🔧 修复 Ruffle 加载问题..."

# 1. 复制本地 Ruffle 文件
echo "1. 复制 Ruffle 文件..."
mkdir -p public/ruffle
if [ -f "/tmp/qqpet-web/Ruffle/ruffle.js" ]; then
  cp /tmp/qqpet-web/Ruffle/ruffle.js public/ruffle/
  echo "✅ Ruffle 文件已复制"
else
  echo "❌ 找不到 Ruffle 文件，尝试从 CDN 下载..."
  curl -L https://unpkg.com/@ruffle-rs/ruffle@latest/ruffle.js -o public/ruffle/ruffle.js
fi

# 2. 检查 SWF 文件
echo "2. 检查 SWF 文件..."
if [ ! -d "public/assets/swf_original/GG" ]; then
  echo "❌ SWF 文件不存在，正在复制..."
  mkdir -p public/assets/swf_original
  cp -r /tmp/qqpet-web/Penguin/GG public/assets/swf_original/
  echo "✅ SWF 文件已复制"
else
  echo "✅ SWF 文件已存在"
fi

# 3. 清除缓存
echo "3. 清除 Vite 缓存..."
rm -rf node_modules/.vite

echo ""
echo "🎉 修复完成！"
echo "现在运行: npm run dev"
```

运行：
```bash
chmod +x fix_ruffle.sh
./fix_ruffle.sh
npm run dev
```

---

## 测试清单

完成修复后，按顺序测试：

- [ ] 启动项目无报错
- [ ] 打开浏览器开发者工具（F12）
- [ ] 鼠标移到企鹅上
- [ ] 点击 🎬 按钮
- [ ] 画廊面板显示
- [ ] 控制台无 Ruffle 错误
- [ ] 点击 "常规动作" → "动作1"
- [ ] 看到企鹅动画播放
- [ ] 切换到其他动画正常

---

## 当前代码状态

**已修改文件**：
- `src/renderer/components/RufflePlayer.tsx` - 使用 CDN 加载 Ruffle

**加载方式**：
```typescript
// 从 CDN 加载
script.src = 'https://unpkg.com/@ruffle-rs/ruffle@latest'

// 如果要使用本地文件，改为：
// script.src = '/ruffle/ruffle.js'
```

---

## 推荐方案总结

### 🥇 最佳方案：本地 Ruffle 文件
- ✅ 不依赖网络
- ✅ 加载速度快
- ✅ 稳定可靠

**操作**：
```bash
cp /tmp/qqpet-web/Ruffle/ruffle.js public/ruffle/
```

然后修改 `RufflePlayer.tsx` 中的路径为 `/ruffle/ruffle.js`

### 🥈 备选方案：CDN
- ✅ 无需额外文件
- ❌ 依赖网络
- ❌ 可能被墙

**当前使用的就是这个方案**

---

现在重启项目试试：
```bash
npm run dev
```

如果还有问题，请告诉我具体的错误信息！
