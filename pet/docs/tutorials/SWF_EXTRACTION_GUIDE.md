# 📦 从 SWF 提取资源完整指南

## 目标
从 43 个原版 QQ 宠物 .swf 文件中提取：
- 🖼️ 动画帧（PNG 序列）
- 🎵 音效文件
- 📐 矢量图形

---

## 🛠️ 推荐工具

### 1. JPEXS Free Flash Decompiler (FFDec) ⭐ 推荐
**最佳选择 - 免费、开源、功能强大**

**下载地址**：
- 官网：https://github.com/jindrapetrik/jpexs-decompiler/releases
- 直接下载：https://github.com/jindrapetrik/jpexs-decompiler/releases/latest

**支持平台**：
- ✅ Windows
- ✅ macOS
- ✅ Linux

**下载文件**：
- macOS: `ffdec_<version>_macosx.zip`
- Windows: `ffdec_<version>.zip`

**运行要求**：
- Java Runtime Environment (JRE) 8+
- macOS 用户检查：`java -version`
- 如果没有 Java：https://www.oracle.com/java/technologies/downloads/

---

## 📖 详细操作步骤

### 步骤 1：安装 JPEXS FFDec

#### macOS:
```bash
# 1. 下载 FFDec
cd ~/Downloads
wget https://github.com/jindrapetrik/jpexs-decompiler/releases/download/version_19.1.0/ffdec_19.1.0_macosx.zip

# 2. 解压
unzip ffdec_19.1.0_macosx.zip

# 3. 运行（如果有权限问题）
cd ffdec_19.1.0
chmod +x ffdec.sh
./ffdec.sh
```

如果遇到 "无法打开，因为它来自身份不明的开发者"：
1. 右键点击 ffdec.sh
2. 选择 "打开方式" → "其他" → "终端"
3. 或在系统偏好设置 → 安全性与隐私 → 仍要打开

#### Windows:
```bash
# 1. 下载并解压 ffdec_<version>.zip
# 2. 双击运行 ffdec.exe
```

---

### 步骤 2：批量提取所有 SWF 的帧

#### 方式 1：使用 GUI (图形界面)

1. **打开 FFDec**
   ```bash
   cd ~/Downloads/ffdec_19.1.0
   ./ffdec.sh
   ```

2. **打开一个 SWF 文件**
   - File → Open → 选择 `public/assets/swf_original/GG/chang/1.swf`

3. **导出所有帧为图片**
   - 左侧树状菜单 → 展开 "sprites" 或 "shapes"
   - 右键点击 → Export selection
   - 选择格式：PNG
   - 选择输出目录：`extracted_frames/chang/1/`
   - 点击 Export

4. **查看提取结果**
   - 每一帧都会保存为单独的 PNG 文件
   - 文件名：`frame_0001.png`, `frame_0002.png`, ...

#### 方式 2：使用命令行 (批量处理) ⚡

创建自动化提取脚本：

**extract_all_swf.sh**:
```bash
#!/bin/bash

# FFDec 路径
FFDEC="/Users/erase/Downloads/ffdec_19.1.0/ffdec.sh"

# SWF 文件目录
SWF_DIR="/Users/erase/Desktop/react_Project/pet/public/assets/swf_original/GG"

# 输出目录
OUTPUT_DIR="/Users/erase/Desktop/react_Project/pet/extracted_frames"

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 遍历所有目录
for category in chang e bing other zt; do
  echo "处理分类: $category"
  mkdir -p "$OUTPUT_DIR/$category"

  # 遍历该分类下的所有 swf 文件
  for swf_file in "$SWF_DIR/$category"/*.swf; do
    if [ -f "$swf_file" ]; then
      filename=$(basename "$swf_file" .swf)
      output_path="$OUTPUT_DIR/$category/$filename"
      mkdir -p "$output_path"

      echo "  提取: $filename"

      # 使用 FFDec 命令行导出
      $FFDEC -export sprite,shape "$output_path" "$swf_file"
    fi
  done
done

echo "✅ 所有文件提取完成！"
echo "查看结果: $OUTPUT_DIR"
```

**运行脚本**:
```bash
chmod +x extract_all_swf.sh
./extract_all_swf.sh
```

---

### 步骤 3：整理提取的帧

提取后的文件结构：
```
extracted_frames/
├── chang/
│   ├── 1/
│   │   ├── frame_0001.png
│   │   ├── frame_0002.png
│   │   └── ...
│   ├── 2/
│   └── ...
├── e/
│   ├── chi1/
│   ├── chi2/
│   └── ...
└── ...
```

---

### 步骤 4：转换为 Sprite Sheet

使用工具将分散的帧合成为 Sprite Sheet：

#### 工具选项：

**1. TexturePacker** (推荐，付费但有试用版)
- 官网：https://www.codeandweb.com/texturepacker
- 支持批量处理
- 自动生成 JSON 配置

**2. ShoeBox** (免费)
- 官网：http://renderhjs.net/shoebox/
- 需要 Adobe AIR

**3. 自己写脚本 (使用 ImageMagick)**
```bash
# 安装 ImageMagick
brew install imagemagick

# 合成 Sprite Sheet（示例）
cd extracted_frames/chang/1
montage frame_*.png -tile x1 -geometry 140x140+0+0 -background transparent sprite_sheet.png
```

---

### 步骤 5：提取音效（如果有）

1. **在 FFDec 中打开 SWF**
2. **左侧树状菜单 → sounds**
3. **右键 → Export selection**
4. **选择格式：WAV 或 MP3**
5. **导出到 `extracted_sounds/` 目录**

---

## 🎨 转换为项目可用格式

### 目标格式（参考 penguin_original）

每个动画需要：
1. **PNG Sprite Sheet** - 所有帧横向或纵向拼接
2. **JSON 配置文件** - 记录每帧的位置

**JSON 格式示例**:
```json
{
  "frames": {
    "0001.png": {
      "frame": { "x": 0, "y": 0, "w": 140, "h": 140 },
      "sourceSize": { "w": 140, "h": 140 }
    },
    "0002.png": {
      "frame": { "x": 140, "y": 0, "w": 140, "h": 140 },
      "sourceSize": { "w": 140, "h": 140 }
    }
  },
  "meta": {
    "image": "sprite_name.png",
    "scale": 1
  }
}
```

### 自动生成脚本

创建 Python 脚本来生成 JSON：

**generate_sprite_json.py**:
```python
import os
import json
from PIL import Image

def create_sprite_sheet(input_dir, output_name):
    """将多个帧图片合成为 sprite sheet"""
    frames = sorted([f for f in os.listdir(input_dir) if f.endswith('.png')])

    if not frames:
        return

    # 加载第一帧获取尺寸
    first_frame = Image.open(os.path.join(input_dir, frames[0]))
    frame_w, frame_h = first_frame.size

    # 创建 sprite sheet（横向排列）
    sprite_width = frame_w * len(frames)
    sprite_height = frame_h
    sprite_sheet = Image.new('RGBA', (sprite_width, sprite_height))

    # JSON 配置
    config = {
        "frames": {},
        "meta": {
            "image": f"{output_name}.png",
            "scale": 1
        }
    }

    # 合成图片并生成配置
    for i, frame_file in enumerate(frames):
        frame = Image.open(os.path.join(input_dir, frame_file))
        x_pos = i * frame_w
        sprite_sheet.paste(frame, (x_pos, 0))

        # 添加到 JSON
        config["frames"][f"{i+1:04d}.png"] = {
            "frame": {"x": x_pos, "y": 0, "w": frame_w, "h": frame_h},
            "sourceSize": {"w": frame_w, "h": frame_h}
        }

    # 保存
    sprite_sheet.save(f"{output_name}.png")
    with open(f"{output_name}.json", 'w') as f:
        json.dump(config, f, indent=2)

    print(f"✅ 生成: {output_name}.png + {output_name}.json ({len(frames)} 帧)")

# 使用示例
create_sprite_sheet('extracted_frames/chang/1', 'output/chang_1')
```

---

## 📋 完整工作流程清单

- [ ] **1. 安装工具**
  - [ ] 下载并安装 JPEXS FFDec
  - [ ] 确认 Java 已安装
  - [ ] (可选) 安装 ImageMagick

- [ ] **2. 提取帧图片**
  - [ ] 使用 GUI 手动提取测试
  - [ ] 使用脚本批量提取所有 SWF
  - [ ] 检查提取结果

- [ ] **3. 整理文件**
  - [ ] 按分类组织帧图片
  - [ ] 重命名文件（统一格式）
  - [ ] 删除空白或错误帧

- [ ] **4. 生成 Sprite Sheet**
  - [ ] 合成单张大图
  - [ ] 生成 JSON 配置
  - [ ] 验证尺寸正确

- [ ] **5. 集成到项目**
  - [ ] 复制到 `public/assets/penguin_original/`
  - [ ] 更新 QQPenguinSprite 组件
  - [ ] 添加新动作映射
  - [ ] 测试播放

---

## 🎯 快速开始（最简单方式）

如果只想快速查看效果：

1. **下载 FFDec**
   ```bash
   open https://github.com/jindrapetrik/jpexs-decompiler/releases
   ```

2. **打开一个 SWF**
   - 双击运行 FFDec
   - 打开 `public/assets/swf_original/GG/chang/1.swf`

3. **查看动画**
   - 在 FFDec 左侧树状菜单中浏览
   - 直接在 FFDec 中预览动画

4. **导出单个动画的帧**
   - 找到想要的 sprite
   - 右键 → Export selection
   - 选择 PNG 格式
   - 导出

---

## 🔍 常见问题

### Q1: FFDec 打不开 SWF 文件
**A**:
- 检查 Java 是否已安装：`java -version`
- 尝试使用命令行：`java -jar ffdec.jar`
- 确认 SWF 文件未损坏

### Q2: 提取的图片是空白的
**A**:
- 某些 SWF 使用矢量图形，需要导出为 SVG 或栅格化
- 在 FFDec 中：Preferences → Export → 勾选 "Export as bitmap"

### Q3: 帧数不对
**A**:
- Flash 动画可能使用补间动画（tween）
- 需要在 FFDec 中启用 "Export all frames"
- 或使用屏幕录制工具捕获

### Q4: 如何批量转换所有 43 个文件？
**A**:
- 使用提供的 `extract_all_swf.sh` 脚本
- 或使用 FFDec 的命令行模式
- 参考上面的批量处理部分

---

## 📚 参考资源

- JPEXS FFDec 文档：https://github.com/jindrapetrik/jpexs-decompiler/wiki
- Flash 格式规范：https://www.adobe.com/devnet/swf.html
- Sprite Sheet 教程：https://www.codeandweb.com/what-is-a-sprite-sheet

---

## ✅ 下一步

提取完成后：
1. 查看 `extracted_frames/` 目录
2. 选择最需要的动画
3. 转换为 Sprite Sheet
4. 集成到 QQPenguinSprite 组件
5. 更新动作映射表

**预计时间**：
- 手动提取单个动画：5-10分钟
- 批量提取所有文件：30-60分钟
- 转换为 Sprite Sheet：1-2小时
- 集成到项目：30分钟

---

**祝提取顺利！有任何问题随时询问。** 🚀
