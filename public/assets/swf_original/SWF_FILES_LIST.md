# QQ 宠物 Flash (SWF) 素材清单

## 文件来源
- **仓库**: https://github.com/ice-cream-headache/ice-cream-headache.github.io
- **作者**: ice-cream-headache
- **复制时间**: 2026-03-07
- **总文件数**: 43 个 .swf 文件

---

## 目录结构

```
swf_original/
├── common.swf              # 公共素材库 (531KB)
└── GG/                     # 哥哥企鹅动画
    ├── bing/               # 生病状态 (3个)
    ├── chang/              # 常规动作 (17个)
    ├── e/                  # 饮食、活动 (9个)
    ├── other/              # 其他特殊动作 (9个)
    ├── run/                # 跑动源文件 (4个 .fla)
    ├── xinqing/            # 心情 (1个)
    └── zt/                 # 状态 (3个)
```

---

## 详细文件列表

### 1. bing/ - 生病状态 (3个)
- `1.swf` - 生病状态1
- `2.swf` - 生病状态2
- `3.swf` - 生病状态3

### 2. chang/ - 常规动作 (17个)
- `1.swf` ~ `12.swf` - 12种常规动作
- `drag.swf` - 拖拽中
- `drag0.swf` - 拖拽开始
- `drop.swf` - 掉落
- `land.swf` - 着陆
- `ok.swf` - 确认/完成

### 3. e/ - 饮食与活动 (9个)
**吃饭系列**：
- `chi1.swf` - 吃饭动作1
- `chi2.swf` - 吃饭动作2
- `chi3.swf` - 吃饭动作3

**喝水系列**：
- `he1.swf` - 喝水动作1
- `he2.swf` - 喝水动作2
- `he3.swf` - 喝水动作3

**其他活动**：
- `xizao.swf` - 洗澡
- `study.swf` - 学习
- `work.swf` - 工作

### 4. other/ - 特殊动作 (9个)
**入场动画**：
- `lai0.swf` - 入场0
- `lai1.swf` - 入场1
- `lai2.swf` - 入场2
- `lai3.swf` - 入场3

**离开动画**：
- `qu0.swf` - 离开0
- `qu1.swf` - 离开1

**特殊事件**：
- `shengji.swf` - 升级
- `si0.swf` - 死亡0
- `si1.swf` - 死亡1

### 5. run/ - 跑动 (4个源文件)
- `yp-fix.fla` - Flash源文件（无法直接使用）
- `yz-fix.fla` - Flash源文件（无法直接使用）
- `zp-fix.fla` - Flash源文件（无法直接使用）
- `zz-fix.fla` - Flash源文件（无法直接使用）

### 6. xinqing/ - 心情 (1个)
- `a-fix.swf` - 心情动作

### 7. zt/ - 状态 (3个)
- `a-fix.swf` - 状态A
- `e.swf` - 饿
- `yang.swf` - 养育

### 8. common.swf
- 公共素材库，可能包含UI、音效等共享资源

---

## 使用建议

### 方式1：直接使用 Ruffle 播放
在网页中集成 Ruffle.js 来播放这些 Flash 动画

### 方式2：提取资源
使用工具从 .swf 中提取：
- 图片帧（PNG序列）
- 音效
- 矢量图形

### 方式3：转换格式
将 .swf 转换为现代格式（PNG sprite sheets、视频等）

---

## 推荐工具

**提取工具**：
- JPEXS Free Flash Decompiler (FFDec) - 免费开源
- SWF Extractor
- Adobe Animate (付费)

**播放工具**：
- Ruffle (https://ruffle.rs/) - 开源 Flash 模拟器
- Flash Player Standalone (已停止更新)

---

## 对比：SWF vs PNG Sprite Sheets

| 特性 | SWF (本目录) | PNG Sprite Sheets (penguin_original/) |
|------|-------------|---------------------------------------|
| 动画数量 | 43+ | 6 |
| 文件格式 | Flash | PNG + JSON |
| 使用难度 | 需要 Ruffle 或提取 | 可直接使用 |
| 动画质量 | 矢量，可无限缩放 | 栅格，固定尺寸 |
| 浏览器支持 | 需要 Ruffle | 原生支持 |
| 特色动画 | 升级、死亡、生病等 | 仅基础动作 |

---

## 注意事项

1. .swf 文件需要 Flash Player 或 Ruffle 才能播放
2. .fla 文件是 Flash 源文件，需要 Adobe Animate 才能打开
3. 提取资源时注意版权问题
4. 部分动画可能包含音效

---

**下一步**：
- [ ] 集成 Ruffle.js 到项目
- [ ] 使用 FFDec 提取关键帧
- [ ] 转换为 PNG sprite sheets
- [ ] 研究动画逻辑
