# 雅儿贝德3D桌面宠物 — 系统架构设计

## 1. 整体架构

```
┌──────────────────────────────────┐
│       Electron Main Process      │
│  ┌────────────┐ ┌──────────────┐ │
│  │ Tray Icon  │ │ Window Mgr   │ │
│  │ Manager    │ │ (透明窗口)    │ │
│  └────────────┘ └──────────────┘ │
├──────────────────────────────────┤
│    Electron Renderer Process     │
│  ┌──────────────────────────────┐│
│  │      Three.js Scene          ││
│  │  ┌────┐ ┌────┐ ┌─────────┐  ││
│  │  │Cam │ │Light│ │Model    │  ││
│  │  └────┘ └────┘ │(GLTF)   │  ││
│  │                 │+ Animation│  ││
│  │                 │ Mixer    │  ││
│  │                 └─────────┘  ││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │    Interaction System        ││
│  │  Click / Drag / Hover / Idle ││
│  └──────────────────────────────┘│
│  ┌──────────────────────────────┐│
│  │    Audio System              ││
│  │  Web Audio API + Voice Clips ││
│  └──────────────────────────────┘│
└──────────────────────────────────┘
```

## 2. 技术选型理由

| 选项 | 结论 | 理由 |
|------|------|------|
| Electron vs Tauri | **Electron** | 透明窗口支持更成熟、Three.js生态更好 |
| Three.js vs Babylon.js | **Three.js** | 社区更大、GLTF加载成熟、文档丰富 |
| GLTF vs FBX | **GLTF 2.0** | Web标准、Three.js原生支持、Blender完美导出 |
| 自定义骨骼 vs Mixamo | **Mixamo + 自定义微调** | 基础动画可用Mixamo、角色特有动画手调 |
| 窗口方案 | **透明无边框 always-on-top** | 桌面宠物标准做法、支持click-through |

## 3. 模型创建流水线

```
[角色设定文档] → [三视图绘制(AI生成)] → [Blender建模]
    → [纹理绘制/烘焙] → [骨骼绑定+权重] → [动画制作]
    → [GLTF导出] → [Three.js加载验证]
```

## 4. 子系统设计

### 4.1 窗口系统
- 透明无边框窗口 (transparent: true, frame: false)
- always-on-top 但不抢焦点
- 鼠标穿透透明区域 (setIgnoreMouseEvents)
- 可拖拽移动宠物位置
- 系统托盘菜单 (显示/隐藏/退出)

### 4.2 渲染系统
- Three.js WebGLRenderer + alpha通道
- 透视相机，固定视角或缓慢自动旋转
- 环境光 + 方向光模拟柔和室内光
- 半透明阴影投影到"虚拟地面"
- 帧率限制60fps，idle时降至30fps节能

### 4.3 动画系统
```javascript
// 待机动画循环 (idle)
idle_breath    // 呼吸微动
idle_blink     // 眨眼 (随机间隔2-5秒)
idle_hair_sway // 发丝微摆
idle_wing_fold // 羽翼轻收轻展

// 交互动画
click_head    // 摸头反应 (害羞低头)
click_body    // 惊吓/转身
drag_move     // 被拖拽移动
hover_react   // 视线跟随光标
dblclick_talk // 双击对话
```

### 4.4 交互系统
- **单击头部**: 播放害羞动画 + 语音 "安兹大人!"
- **单击身体**: 小幅跳跃/转身
- **拖拽**: 跟随鼠标移动窗口位置
- **悬停**: 眼睛/头部跟随光标
- **双击**: 循环播放对话语音
- **右键菜单**: 设置/换装/截图/退出
- **定时闲置**: 5分钟无人交互→进入小憩动画

### 4.5 音频系统
- 语音片段预加载 (Web Audio API)
- 交互触发对应语音
- 随机闲置语音 (间隔30-120秒)
- 音量控制、静音开关

## 5. 桌面部署方案

| 平台 | 方案 |
|------|------|
| **Windows** | Electron-builder → NSIS安装包 / 便携版 |
| **macOS** | Electron-builder → DMG |
| **Linux** | AppImage / deb |

## 6. 文件结构补充

```
src/
├── main/                    # Electron主进程
│   ├── main.js              # 入口
│   ├── tray.js              # 系统托盘
│   └── window-manager.js    # 窗口管理
├── renderer/                # 渲染进程
│   ├── index.html
│   ├── scene.js             # Three.js场景
│   ├── model-loader.js      # GLTF加载
│   ├── animation-controller.js
│   ├── interaction.js       # 鼠标交互
│   ├── audio-manager.js
│   └── styles.css
└── preload.js
assets/
├── models/albedo.glb        # 3D模型
├── textures/                 # 纹理贴图
├── audio/                    # 语音片段
│   ├── greeting.mp3
│   ├── shy.mp3
│   ├── idle_1~5.mp3
│   └── ...
└── reference/                # 三视图参考图
    ├── front_view.png
    ├── side_view.png
    └── back_view.png
```

## 7. 开发里程碑

| 阶段 | 内容 | 估时 |
|------|------|------|
| M1 | 骨架创建 + 架构文档 | ✅ |
| M2 | 三视图设计稿生成 | 1h |
| M3 | 3D模型制作 (Blender) | 4h |
| M4 | Electron + Three.js基础框架 | 2h |
| M5 | 动画系统 + 交互系统 | 3h |
| M6 | 音频 + 语音集成 | 1h |
| M7 | 打包测试 | 2h |
