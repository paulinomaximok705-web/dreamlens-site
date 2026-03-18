# DreamLens — AI 梦境解析平台

> 融合荣格心理学、东方象征体系与现代情绪分析的智能梦境解析工具，
> 并通过 AI 图片生成技术将梦境意象转化为专属艺术画作。

---

## 📁 项目结构

```
index.html          首页
analyze.html        梦境解析页（核心功能）
diary.html          🆕 梦境日记页
pricing.html        套餐定价页（暂未在导航展示）
css/
  dreamscape.css    全站统一设计系统（Dreamscape v3）
  analyze.css       解析页专属样式
  diary.css         🆕 日记页专属样式
  index.css         首页专属样式
js/
  main.js           全站公共脚本（showToast、星空等）
  analyze-init.js   解析页初始化
  analyze.js        梦境解析核心逻辑（动态解析引擎）
  dream-art.js      AI 梦境图片生成模块
  voice.js          语音输入模块
  diary.js          🆕 梦境日记完整逻辑
```

---

## ✅ 已完成功能

### 🏠 首页 `index.html`
- 动态星空背景 + 浮动能量球
- 功能介绍、工作原理三步流程、用户评价
- 导航：首页 · 工作原理 · 功能特色 · **梦境日记** · 免费体验

### 🔮 梦境解析页 `analyze.html`
- 文字 + 语音双模式输入
- **动态 AI 解析引擎**：严格基于用户输入原文生成，含摘要、象征解读（25种）、情绪能量（8类）、心理学解读、潜意识信息、行动建议
- **AI 梦境艺术画生成**（fal FLUX.1 schnell，多提示词尝试）
- 4 种艺术风格切换
- 解析完成后自动保存到日记（含完整 AI 解析数据）
- "保存到日记"按钮直接跳转日记页
- 支持从日记页回来重新解析（`#reanalyze` + `sessionStorage`）

### 📖 梦境日记页 `diary.html` 🆕
- **列表展示**：卡片式网格布局，显示标题、日期、情绪、梦境摘要、主题标签
- **AI解析标记**：已解析的条目显示 ✨ AI解析 徽章
- **搜索**：实时防抖搜索（标题+内容+情绪）
- **筛选**：按情绪（8种）、按主题（8类）过滤
- **排序**：最新/最早优先
- **情绪趋势图**：Chart.js 折线图，展示最近20条情绪分布，可折叠
- **统计栏**：总记录数、记录天数、最常见情绪、主要梦境主题（数字滚动动画）
- **手动记录弹窗**：标题、内容、情绪选择、日期，支持编辑已有记录
- **详情弹窗**：展示梦境原文 + 完整 AI 解析（摘要、情绪条、心理解读、潜意识、行动建议）
- **编辑 / 删除**：支持修改和删除单条记录
- **重新解析**：跳转到解析页并自动填入内容
- **分页**：每页9条，支持翻页
- **导出**：一键导出所有日记为 TXT 文件
- **清空**：带确认弹窗的清空全部功能
- **空状态/无结果**：引导性提示页面

---

## 🚀 页面入口 URI

| 路径 | 说明 |
|------|------|
| `/index.html` | 首页 |
| `/analyze.html` | 梦境解析 + AI 图片生成 |
| `/analyze.html#reanalyze` | 从日记页跳转重新解析（自动填入内容）|
| `/diary.html` | 梦境日记 |

---

## 💾 数据存储格式

所有数据存储在 `localStorage['dreamlens_diary']`（JSON 数组）：

```json
{
  "id": "1234567890",
  "title": "深海与金色使者",
  "text": "用户完整梦境原文...",
  "emotion": "安宁",
  "date": "2026/3/3",
  "isoDate": "2026-03-03",
  "theme": "water",
  "timestamp": 1234567890,
  "manual": false,
  "analysis": {
    "summary": "AI生成摘要...",
    "emotions": [{ "label":"宁静", "pct":80, "color":"..." }],
    "symbols": [{ "name":"深海", "meaning":"..." }],
    "psychology": "心理学解读...",
    "unconscious": "潜意识信息...",
    "advice": "行动建议..."
  }
}
```

---

## 🔌 外部服务

| 服务 | 用途 | 费用 |
|------|------|------|
| fal FLUX.1 schnell | AI 图片生成（多提示词尝试）| 低成本 |

### Image API 配置
默认使用后端接口 `/api/image`（需部署）。在 `analyze.html` 里设置：
`window.DREAMLENS_IMAGE_API = 'https://YOUR-VERCEL-APP.vercel.app/api/image';`

后端函数在 `api/image.js`，需要环境变量 `FAL_KEY`。
| Chart.js 4.4 CDN | 日记情绪趋势图 | 免费 |
| Google Fonts | Noto Serif/Sans SC | 免费 |
| Font Awesome 6 | 图标库 | 免费 |

---

## ⏳ 待实现功能

- [ ] 梦境标签云 / 高频词统计
- [ ] 月历视图（按日历展示梦境记录）
- [ ] 梦境模式分析（跨记录的重复意象统计）
- [ ] 梦境分享卡片（生成精美图片）

---

*© 2026 DreamLens · 本产品不替代专业心理咨询*
