# 📚 项目文档索引

本目录包含 QQ 宠物桌面应用的所有技术文档和开发指南。

## 📁 文档结构

### 🚀 [guides/](./guides/) - 开发指南
核心开发文档，了解项目架构和开发流程
- `START_HERE.md` - 新手入门指南 ⭐
- `SETUP.md` - 开发环境配置
- `REQUIREMENTS.md` - 项目需求文档
- `ROADMAP.md` - 功能路线图

### 🛠️ [implementation/](./implementation/) - 技术实现
详细的技术实现方案和架构决策
- `IMPLEMENTATION_SUMMARY.md` - 实现总结
- `FLASH_INTEGRATION_SUMMARY.md` - Flash 集成方案
- `ANIMATION_SOLUTION_COMPARISON.md` - 动画方案对比（SWF vs PNG）⭐
- `STORAGE_INFO.md` - 数据存储方案

### 🔧 [fixes/](./fixes/) - 问题修复
已解决的技术问题和修复方案
- `RUFFLE_FINAL_FIX.md` - Ruffle 最终修复方案
- `RUFFLE_FIX_GUIDE.md` - Ruffle 问题排查指南
- `ANIMATION_SWITCH_FIX.md` - 动画切换修复
- `CLEAR_CACHE_AND_TEST.md` - 缓存清理和测试
- `UI_FIXES.md` - UI 修复记录
- `QUICK_FIX.md` - 快速修复记录

### 📖 [tutorials/](./tutorials/) - 使用教程
功能使用和开发教程
- `HOW_TO_USE_SWF_GALLERY.md` - SWF 画廊使用指南
- `PENGUIN_QUICK_START.md` - 企鹅快速上手
- `PENGUIN_SETUP.md` - 企鹅配置详解
- `PENGUIN_SWITCH_GUIDE.md` - 企鹅切换指南
- `PLAY_SWF_ON_PET.md` - 在宠物上播放 SWF
- `SWF_EXTRACTION_GUIDE.md` - SWF 素材提取教程

### 🐛 [dev/](./dev/) - 开发调试
开发过程中的调试和开发记录
- `DEBUG_CHAT.md` - 聊天功能调试
- `DIRECT_CLAUDE.md` - Claude API 直接调用
- `PROGRESS.md` - 开发进度记录

### 🎨 [assets/](./assets/) - 资源相关
素材和资源相关文档
- `QQPET_GITHUB_ASSETS.md` - GitHub 素材资源
- `INTEGRATION_COMPLETED.md` - 集成完成记录

## 🎯 快速导航

### 我是新手，从哪里开始？
1. 先读 [guides/START_HERE.md](./guides/START_HERE.md)
2. 然后看 [guides/SETUP.md](./guides/SETUP.md) 配置环境
3. 参考 [implementation/ANIMATION_SOLUTION_COMPARISON.md](./implementation/ANIMATION_SOLUTION_COMPARISON.md) 了解当前技术方案

### 我遇到了问题
- 查看 [fixes/](./fixes/) 目录下的相关修复文档
- Ruffle 相关问题：[fixes/RUFFLE_FINAL_FIX.md](./fixes/RUFFLE_FINAL_FIX.md)
- 动画切换问题：[fixes/ANIMATION_SWITCH_FIX.md](./fixes/ANIMATION_SWITCH_FIX.md)

### 我想添加新功能
1. 查看 [guides/ROADMAP.md](./guides/ROADMAP.md) 了解规划
2. 参考 [implementation/](./implementation/) 目录了解现有实现
3. 查看根目录的 `TODO.md` 了解待办事项

## 📝 根目录文档

根目录保留的核心文档：
- `README.md` - 项目主文档
- `CHANGELOG.md` - 版本变更记录
- `TODO.md` - 待办事项清单

## 🔄 最新更新

**2024-03-09**
- ✅ 项目完全切换到 SWF + Ruffle 方案
- ✅ 废弃 PNG Sprite Sheet 方案
- ✅ 修复 Ruffle 实例管理问题
- ✅ 优化动画播放和结束逻辑
- ✅ 整理文档结构
