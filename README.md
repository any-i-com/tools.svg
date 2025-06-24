# SVG Tools - 专业SVG编辑器

一个功能强大的SVG编辑、优化和生成工具，基于Next.js 14构建。

## 🌟 功能特性

### 核心功能
- **实时SVG编辑器** - 使用Monaco Editor提供代码高亮和智能提示
- **实时预览** - 编辑代码时即时看到SVG渲染效果
- **SVG信息面板** - 显示SVG的尺寸、ViewBox、元素数量等信息

### 文件操作
- **导入SVG文件** - 支持从本地上传SVG文件
- **导出SVG** - 将编辑后的SVG保存为文件
- **导出PNG** - 将SVG转换为PNG图片格式
- **复制到剪贴板** - 一键复制SVG代码

### 代码优化
- **代码格式化** - 自动格式化SVG代码，提高可读性
- **SVG优化** - 压缩SVG代码，减小文件大小
- **智能优化选项** - 多种优化策略可选

### 形状生成器
- **预设形状** - 快速生成圆形、方形、三角形、星形、六边形
- **自定义参数** - 调整大小、颜色、边框等属性
- **实时预览** - 参数调整时实时预览效果

### 界面特性
- **现代化UI** - 简约高级的用户界面设计
- **响应式布局** - 适配不同屏幕尺寸
- **暗色主题支持** - 支持明暗主题切换
- **全屏模式** - 支持全屏编辑模式

## 🚀 快速开始

### 环境要求
- Node.js 18.0 或更高版本
- pnpm (推荐) 或 npm

### 安装依赖
```bash
pnpm install
```

### 开发环境运行
```bash
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本
```bash
pnpm build
pnpm start
```

## 🛠️ 技术栈

- **Next.js 14** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Monaco Editor** - 代码编辑器
- **Lucide React** - 图标库
- **html-to-image** - 图片导出
- **file-saver** - 文件下载

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── ui/               # UI 组件
│   ├── SVGShapeGenerator.tsx  # 形状生成器
│   └── SVGOptimizer.tsx   # SVG 优化器
├── public/               # 静态资源
└── ...
```

## 🎯 使用指南

### 基本使用
1. 在左侧编辑器中输入或粘贴SVG代码
2. 右侧预览区域会实时显示SVG效果
3. 使用顶部工具栏进行文件操作和功能调用

### 形状生成
1. 使用形状生成器快速创建基础形状
2. 调整大小、颜色、边框等参数
3. 点击"生成形状"将SVG代码插入编辑器

### 代码优化
1. 使用"格式化"按钮整理代码结构
2. 使用"优化"按钮压缩SVG代码
3. 通过优化器面板进行高级优化设置

### 文件操作
1. 点击"上传SVG"导入本地文件
2. 使用"导出SVG"或"导出PNG"保存作品
3. 使用"复制"按钮快速复制代码

## 🔧 自定义配置

### 主题配置
项目使用CSS变量实现主题系统，可以在`globals.css`中自定义颜色方案。

### 编辑器配置
Monaco Editor的配置在`page.tsx`中，可以根据需要调整语言、主题、字体大小等选项。

## 📈 性能优化

- 使用Next.js 14的App Router实现更好的性能
- 组件懒加载减少初始包大小
- SVG优化减少文件大小
- 响应式设计适配各种设备

## 🔍 SEO优化

### 元数据优化
- **完整的页面元数据** - 包含title、description、keywords等
- **Open Graph标签** - 社交媒体分享优化
- **Twitter Card** - Twitter分享优化
- **结构化数据** - Schema.org WebApplication标记

### 技术SEO
- **动态Sitemap** - 自动生成XML站点地图
- **Robots.txt** - 搜索引擎爬虫指令
- **语义化HTML** - 使用main、header、nav、section、article标签
- **可访问性优化** - aria-label、role属性完善

### 内容优化
- **关键词策略** - 覆盖"SVG编辑器"、"在线SVG工具"等核心关键词
- **长尾关键词** - "SVG代码编辑器"、"SVG优化压缩"等
- **多语言支持** - 中文内容优化，适合中文搜索环境

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目。

## 📄 许可证

本项目基于MIT许可证开源。 