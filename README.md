# AI搜索建议助手 🤖

一个现代化的AI风格网站，用于获取和分析Google搜索建议。基于原有的Python爬虫脚本重构，提供美观的Web界面和丰富的功能。

## ✨ 功能特性

### 🎨 设计特色
- **AI风格设计**: 深色主题 + 渐变色彩，符合现代AI网站美学
- **响应式布局**: 完美适配手机、平板、桌面端
- **流畅动画**: 卡片悬浮、进度条闪光、按钮特效等细节动画
- **毛玻璃效果**: backdrop-filter 打造的现代视觉体验

### 🌍 多语言支持
- **中英文切换**: 支持简体中文和英文界面
- **本地化存储**: 自动记住用户的语言偏好
- **实时翻译**: 获取的英文建议自动翻译为中文

### 🔧 核心功能
- **词根生成**: 输入词根自动生成 a-z 组合的搜索关键词
- **固定关键词**: 支持直接输入完整的搜索关键词
- **批量获取**: 一键获取所有关键词的Google搜索建议
- **实时进度**: 显示当前处理进度和统计信息
- **结果对比**: 自动对比新旧结果，标识新增建议
- **数据导出**: 支持JSON格式导出所有结果数据

### 🎯 高级特性
- **配置管理**: 导入/导出配置文件
- **本地存储**: 自动保存配置和历史结果
- **结果筛选**: 支持搜索和按状态筛选结果
- **主题切换**: 深色/浅色主题切换
- **错误处理**: 完善的错误提示和异常处理

## 🚀 快速开始

### 1. 直接使用
1. 下载所有文件到本地文件夹
2. 双击打开 `index.html` 文件
3. 开始使用！

### 2. 本地服务器（推荐）
```bash
# 使用Python启动本地服务器
python -m http.server 8000

# 或使用Node.js
npx serve .

# 或使用PHP
php -S localhost:8000
```

然后在浏览器中访问 `http://localhost:8000`

## 📖 使用指南

### 配置关键词
1. **词根列表**: 输入词根，每行一个，系统会自动生成 a-z 组合
   ```
   AI
   machine learning
   data science
   ```

2. **固定关键词**: 输入完整的搜索关键词，每行一个
   ```
   artificial intelligence tools
   best AI software 2024
   python programming tutorial
   ```

### 开始获取建议
1. 配置好关键词后，点击"开始获取建议"按钮
2. 系统会显示实时进度和当前处理的关键词
3. 获取完成后会显示统计信息和结果对比

### 查看和管理结果
- **搜索结果**: 使用搜索框快速查找特定的建议
- **筛选功能**: 按"全部"、"成功"、"新增"筛选结果
- **下载数据**: 点击"下载结果"导出JSON格式的完整数据

## 🛠️ 技术架构

### 前端技术栈
- **HTML5**: 语义化标签和现代Web标准
- **CSS3**: Flexbox/Grid布局，CSS变量，动画效果
- **原生JavaScript**: ES6+语法，模块化设计
- **Font Awesome**: 图标库
- **Google Fonts**: Inter字体

### 核心模块
- **多语言系统**: 基于对象的翻译映射
- **主题系统**: CSS变量实现的主题切换
- **存储系统**: localStorage持久化数据
- **网络请求**: 使用代理服务解决CORS问题
- **进度管理**: 异步任务的进度跟踪

### API设计
```javascript
// Google搜索建议API
const apiUrl = 'https://suggestqueries.google.com/complete/search';
const proxyUrl = 'https://api.allorigins.win/raw?url=';

// 请求参数
const params = {
    client: 'firefox',
    q: keyword,
    hl: 'en-US'
};
```

## 🎨 界面展示

### 主界面
- **导航栏**: 品牌Logo + 语言/主题切换
- **英雄区域**: 标题和描述，渐变图标动画
- **配置面板**: 词根和关键词输入区域
- **操作按钮**: 开始/停止/下载等操作

### 进度界面
- **进度条**: 带闪光效果的动态进度条
- **统计信息**: 已处理/总数/成功数量
- **当前状态**: 显示正在处理的关键词

### 结果展示
- **卡片布局**: 每个关键词对应一个结果卡片
- **双语显示**: 英文建议 + 中文翻译
- **状态标识**: 成功/失败/新增等状态标记

## 📱 响应式设计

### 桌面端（>768px）
- 多列网格布局
- 完整的导航和控制面板
- 大尺寸的按钮和间距

### 平板端（768px-480px）
- 两列网格布局
- 调整间距和字体大小
- 优化触控体验

### 手机端（<480px）
- 单列布局
- 简化导航栏
- 全宽按钮和表单

## 🔧 自定义配置

### 修改颜色主题
编辑 `styles.css` 中的CSS变量：
```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    /* 更多颜色配置... */
}
```

### 添加翻译语言
在 `script.js` 中的 `translations` 对象添加新语言：
```javascript
const translations = {
    zh: { /* 中文翻译 */ },
    en: { /* 英文翻译 */ },
    es: { /* 西班牙语翻译 */ }
};
```

### 配置翻译词典
在 `mockTranslate` 函数中添加更多翻译词汇：
```javascript
const simpleDict = {
    'artificial intelligence': '人工智能',
    'machine learning': '机器学习',
    // 添加更多翻译...
};
```

## 🐛 常见问题

### Q: 为什么获取建议失败？
A: 可能的原因：
- 网络连接问题
- 代理服务暂时不可用
- Google API限制
- 关键词格式问题

### Q: 如何提高获取成功率？
A: 建议：
- 确保网络连接稳定
- 使用常见的英文关键词
- 避免过于频繁的请求
- 检查浏览器控制台的错误信息

### Q: 翻译功能不准确怎么办？
A: 当前使用简单的词典翻译，可以：
- 扩展翻译词典
- 接入真实的翻译API（如Google Translate API）
- 手动校正翻译结果

## 📄 许可证

MIT License - 详见LICENSE文件

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目！

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- GitHub Issues
- Email: [你的邮箱]

---

Made with ❤️ and AI ✨ 