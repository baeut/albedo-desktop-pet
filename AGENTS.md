# AGENTS.md — AI 编码 Agent 指令

## 项目
雅儿贝德3D桌面宠物 (Albedo Desktop Pet) — Electron + Three.js 桌面应用

## 角色设定
雅儿贝德 — 守护者总管，琥珀金瞳，鸦羽长发，黑色犄角，白色纱裙，黑翼，金蛛网项圈

## 技术约束
- Electron 28+ (transparent window, always-on-top)
- Three.js WebGL (GLTF 2.0 model)
- 不使用额外重型框架，保持轻量
- 透明区域必须支持鼠标穿透 (click-through)

## 代码风格
- ES Module (import/export)
- 每个子系统独立模块
- 函数注释用 JSDoc
- 事件驱动架构

## 文件模式
- src/main/ → Electron 主进程
- src/renderer/ → 渲染进程 (Three.js)
- assets/models/ → 3D 模型 (.glb)
- assets/audio/ → 语音片段 (.mp3)
- assets/reference/ → 三视图参考图

## 构建
```bash
# 开发模式
npm run dev
# 打包
npm run build
```
