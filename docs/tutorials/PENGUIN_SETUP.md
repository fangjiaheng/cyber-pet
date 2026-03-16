# 🐧 QQ宠物企鹅素材提取与使用指南

## 📦 第一步：获取QQ宠物客户端

### 方案A：下载单机版（推荐）

1. **下载地址**：
   - 直接下载：http://do1.3h3.com/QQPet37.exe
   - B站教程：https://www.bilibili.com/video/BV1PF411t7nX/

2. **安装步骤**：
   ```bash
   # 双击 QQPet37.exe 安装
   # 默认安装路径：C:\Program Files\QQPet
   # 或者桌面直接运行（绿色版）
   ```

3. **找到资源文件**：
   ```
   QQPet安装目录/
   ├── res/              # 资源文件夹
   │   ├── pet.swf       # 企鹅主体动画
   │   ├── penguin.swf   # 可能的企鹅文件
   │   └── ...
   └── data/
       └── *.swf         # 其他动画资源
   ```

### 方案B：从粉丝网站获取

1. 访问：https://qpetlover.cn/QPetGames/
2. 打开浏览器开发者工具（F12）
3. 切换到 Network 标签
4. 刷新页面，筛选 .swf 文件
5. 右键下载 SWF 文件

---

## 🔨 第二步：提取SWF动画帧

### 使用 JPEXS Free Flash Decompiler（推荐）

1. **下载工具**：
   - GitHub: https://github.com/jindrapetrik/jpexs-decompiler
   - 或访问：https://www.free-decompiler.com/flash/

2. **提取步骤**：

   ```bash
   # 1. 打开 JPEXS FFDec
   # 2. File → Open → 选择 pet.swf

   # 3. 在左侧树形菜单中找到：
   #    - sprites（精灵图）
   #    - DefineSprite（动画精灵）
   #    - images（图片资源）

   # 4. 找到企鹅相关的 MovieClip，例如：
   #    - penguin_idle
   #    - penguin_walk
   #    - penguin_eat

   # 5. 右键 → Export Selection
   #    - 格式：PNG Sequence
   #    - 选项：
   #      ✓ Transparent background（透明背景）
   #      ✓ Keep aspect ratio（保持宽高比）
   #      Frame rate: 12 fps（帧率）

   # 6. 导出到项目目录：
   #    public/assets/penguin/idle/
   #    public/assets/penguin/walk/
   #    ... 等等
   ```

3. **批量导出技巧**：
   - 选中多个 MovieClip，Ctrl+点击
   - 右键 → Export Selection → 批量导出

4. **重命名帧文件**：
   ```bash
   # JPEXS 导出的文件可能命名为：frame_0.png, frame_1.png
   # 需要重命名为：idle_0.png, idle_1.png

   # Windows 批量重命名：
   cd public/assets/penguin/idle
   ren frame_0.png idle_0.png
   ren frame_1.png idle_1.png
   # ... 或使用 PowerShell 脚本

   # macOS/Linux 批量重命名：
   cd public/assets/penguin/idle
   for i in frame_*.png; do
     num=$(echo $i | grep -oP '\d+')
     mv "$i" "idle_$num.png"
   done
   ```

### 使用 Swf2Png 工具（替代方案）

1. 下载：https://download.csdn.net/download/jjgame/9492451
2. 解压后运行 Swf2Png.exe
3. 拖入 SWF 文件
4. 设置参数：
   - 透明背景：✓
   - 帧率：12 fps
   - 导出格式：PNG
5. 点击"导出"

---

## 📁 第三步：组织素材文件

### 目录结构

```
public/assets/penguin/
├── idle/           # 待机动画（8帧）
│   ├── idle_0.png
│   ├── idle_1.png
│   ├── ...
│   └── idle_7.png
├── walk/           # 走路动画（12帧）
│   ├── walk_0.png
│   ├── ...
│   └── walk_11.png
├── run/            # 跑步动画（10帧）
├── sit/            # 坐下动画（6帧）
├── sleep/          # 睡觉动画（4帧）
├── eat/            # 吃东西动画（16帧）
├── bathe/          # 洗澡动画（20帧）
├── play/           # 玩耍动画（24帧）
├── work/           # 工作动画（12帧）
├── happy/          # 开心表情（10帧）
├── sad/            # 难过表情（8帧）
└── angry/          # 生气表情（8帧）
```

### 命名规范

- **格式**：`{action}_{frameNumber}.png`
- **示例**：`idle_0.png`, `walk_5.png`, `eat_12.png`
- **从0开始编号**：0, 1, 2, 3, ...

---

## 🎮 第四步：在项目中使用

### 集成到 App.tsx

```tsx
import { QQPenguin } from './components/QQPenguin'

function App() {
  const [action, setAction] = useState<PenguinAction>('idle')

  return (
    <div className="app">
      <QQPenguin
        action={action}
        scale={1.2}
        showEntrance={true}
        onClick={() => {
          console.log('企鹅被点击了！')
          setAction('happy')
          setTimeout(() => setAction('idle'), 2000)
        }}
        onAnimationComplete={() => {
          console.log('动画播放完成')
          setAction('idle')
        }}
      />
    </div>
  )
}
```

### 配置动画参数

如果提取的帧数和预设不同，在 `QQPenguin.tsx` 中修改 `ANIMATION_CONFIG`：

```typescript
const ANIMATION_CONFIG = {
  idle: {
    frames: 8,        // ← 改成实际提取的帧数
    fps: 8,           // ← 调整播放速度
    loop: true,       // ← 是否循环
    folder: 'idle'    // ← 文件夹名称
  },
  // ... 其他动画
}
```

---

## 🚨 常见问题

### Q1: 找不到 SWF 文件？

**解决方案**：
- QQ宠物可能使用了加密或打包的资源文件
- 尝试搜索 `.pak`, `.dat`, `.bin` 等文件
- 使用工具：ResourceHacker、7-Zip 尝试解包

### Q2: 提取的图片背景不透明？

**解决方案**：
- 在 JPEXS 中勾选 "Transparent background"
- 如果仍然有白色背景，使用 Photoshop/GIMP 批量去除白色背景
- 在线工具：https://www.remove.bg/（批量去背景）

### Q3: 动画看起来卡顿？

**原因**：
- 帧数不足
- FPS 设置过低

**解决方案**：
- 提取更多中间帧（在 JPEXS 中设置更高的帧率）
- 增加 `ANIMATION_CONFIG` 中的 `fps` 值
- 使用补帧工具：DAIN、Flowframes

### Q4: 图片尺寸不一致？

**解决方案**：
```bash
# 使用 ImageMagick 批量调整尺寸
cd public/assets/penguin/idle
mogrify -resize 150x200! *.png

# macOS 安装 ImageMagick:
brew install imagemagick
```

### Q5: 没有找到企鹅动画？

**可能原因**：
- 动画在其他 SWF 文件中
- 动画是代码生成的（不是素材）

**解决方案**：
- 检查所有 `.swf` 文件
- 查找 `penguin`, `pet`, `animal` 等关键词的 MovieClip
- 如果找不到，考虑使用方案B（自己画或找替代素材）

---

## 🎨 替代方案：如果无法提取原版素材

### 方案1：使用开源企鹅素材

- **Kenny Assets**: https://www.kenney.nl/assets（免费游戏素材）
- **OpenGameArt**: https://opengameart.org/（搜索 "penguin"）
- **itch.io**: https://itch.io/game-assets/free（搜索 "2d penguin sprite"）

### 方案2：AI 生成企鹅精灵图

使用 AI 工具生成：
- **Midjourney**: "pixel art penguin sprite sheet, 8 frames, transparent background, cute style"
- **Stable Diffusion**: 使用 ControlNet + Sprite Sheet 生成
- **Leonardo AI**: 免费生成游戏素材

### 方案3：委托美术制作

在以下平台找美术师：
- 站酷、UI中国
- Fiverr（国际）
- 猪八戒网

预算：500-2000元（根据复杂度）

---

## 📚 参考资源

- [JPEXS Flash Decompiler 官方文档](https://github.com/jindrapetrik/jpexs-decompiler/wiki)
- [SWF转PNG工具 - CSDN](https://download.csdn.net/download/jjgame/9492451)
- [QQ宠物爱好者社区](https://qpetlover.cn)
- [Sprite Animation 教程](https://www.youtube.com/watch?v=2TylEr6tf6A)

---

**最后更新**: 2026-03-06 21:10
