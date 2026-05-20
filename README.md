# Albedo Desktop Pet — 雅儿贝德3D桌面宠物

## 项目概述
基于 Electron + Three.js 构建的雅儿贝德3D桌面宠物，运行于Windows/Mac/Linux桌面，支持鼠标交互、待机动画、语音反馈。

## 技术栈
- **渲染引擎**: Three.js (WebGL 2.0)
- **桌面框架**: Electron 28+
- **3D模型**: GLTF 2.0 (Blender → GLB)
- **动画系统**: Three.js AnimationMixer + 自定义骨骼动画
- **交互**: 鼠标事件 (点击/拖拽/悬停/滚轮缩放)
- **音频**: Web Audio API (语音反馈)
- **窗口**: 透明无边框窗口 (always-on-top, click-through透明区域)

## 快速启动
```bash
cd src/orchestrator
npm install
npm run dev
```

## 项目结构
见 ARCHITECTURE.md

## 角色设定
雅儿贝德 — 纳萨力克守护者总管
- 瓜子脸、琥珀金瞳、黑色犄角
- 及腰鸦羽长发、左肩白色金色肩甲
- 纯白纱裙、腰间黑翼、金色蛛网项圈
