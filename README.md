# 🖥️ AccountManage Frontend - 账号密码管理系统前端

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.4-blue" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-5.4-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Element%20Plus-2.5-409eff" alt="Element Plus">
  <img src="https://img.shields.io/badge/Vite-5.1-646cff" alt="Vite">
  <img src="https://img.shields.io/badge/Pinia-2.1-ffd859" alt="Pinia">
  <img src="https://img.shields.io/badge/License-AGPL--3.0-blue" alt="License">
</p>

<p align="center">
  账号密码管理系统的前端项目，基于 Vue 3 + TypeScript + Element Plus 构建。
</p>

---

## 📋 目录

- [项目简介](#-项目简介)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
- [开发指南](#-开发指南)
- [环境配置](#-环境配置)
- [构建部署](#-构建部署)
- [许可证](#-许可证)

---

## 📖 项目简介

这是账号密码管理系统的前端项目，与后端项目 [accountManage](https://github.com/wo1261931780/accountManage) 配合使用。

### 主要功能

- 🔐 **用户登录**: JWT 认证，支持 Token 自动刷新
- 📊 **仪表盘**: 数据统计可视化，ECharts 图表展示
- 🔑 **账号管理**: 账号的增删改查，密码安全显示
- 🏢 **平台管理**: 平台信息管理，支持分类和图标
- ⭐ **收藏功能**: 常用账号快速访问
- 🛠️ **密码工具**: 随机密码生成器，密码强度检测
- 🔍 **智能搜索**: 全局搜索，多条件筛选

---

## 🏗️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue.js | 3.4 | 前端框架 |
| TypeScript | 5.4 | 类型安全 |
| Vite | 5.1 | 构建工具 |
| Element Plus | 2.5 | UI 组件库 |
| Pinia | 2.1 | 状态管理 |
| Vue Router | 4.3 | 路由管理 |
| Axios | 1.6 | HTTP 客户端 |
| ECharts | 5.5 | 数据可视化 |
| SCSS | 1.71 | CSS 预处理器 |

---

## 📁 项目结构

```
account_manager_vue3/
├── public/                     # 静态资源
├── src/
│   ├── api/                    # API 接口封装
│   │   ├── account.ts          # 账号相关 API
│   │   ├── auth.ts             # 认证相关 API
│   │   ├── dashboard.ts        # 仪表盘 API
│   │   └── platform.ts         # 平台相关 API
│   ├── layout/                 # 布局组件
│   │   ├── index.vue           # 主布局
│   │   └── components/
│   │       ├── Header.vue      # 顶部导航
│   │       └── Sidebar.vue     # 侧边栏
│   ├── router/                 # 路由配置
│   │   └── index.ts
│   ├── stores/                 # Pinia 状态管理
│   │   ├── app.ts              # 应用状态
│   │   ├── index.ts
│   │   └── user.ts             # 用户状态
│   ├── styles/                 # 全局样式
│   │   ├── index.scss          # 入口样式
│   │   └── variables.scss      # SCSS 变量
│   ├── types/                  # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/                  # 工具函数
│   │   └── request.ts          # Axios 封装
│   ├── views/                  # 页面视图
│   │   ├── account/            # 账号管理页
│   │   ├── dashboard/          # 仪表盘
│   │   ├── error/              # 错误页面
│   │   ├── favorites/          # 收藏页面
│   │   ├── login/              # 登录页
│   │   ├── password-tools/     # 密码工具
│   │   ├── platform/           # 平台管理
│   │   ├── platform-type/      # 平台类型
│   │   └── settings/           # 系统设置
│   ├── App.vue                 # 根组件
│   └── main.ts                 # 入口文件
├── .env.development            # 开发环境配置
├── .env.production             # 生产环境配置
├── .gitignore                  # Git 忽略文件
├── index.html                  # HTML 模板
├── package.json                # 依赖配置
├── tsconfig.json               # TypeScript 配置
├── tsconfig.node.json          # Node TypeScript 配置
├── vite.config.ts              # Vite 配置
├── LICENSE                     # 许可证
└── README.md                   # 项目说明
```

---

## 🚀 快速开始

### 环境要求

- **Node.js**: 18.0+
- **npm**: 9.0+ 或 **pnpm**: 8.0+

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm
pnpm install
```

### 开发模式启动

```bash
npm run dev
```

前端服务将启动在 http://localhost:3000

### 生产构建

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

---

## 📝 开发指南

### API 代理配置

开发环境下，Vite 会自动代理 `/api` 请求到后端服务：

```typescript
// vite.config.ts
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

### 环境变量

创建 `.env.development` 和 `.env.production` 文件配置不同环境：

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=账号密码管理系统

# .env.production
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_TITLE=账号密码管理系统
```

### 代码规范

```bash
# 运行 ESLint 检查并自动修复
npm run lint
```

---

## 🔧 环境配置

### 后端服务

本前端项目需要配合后端服务使用：

- **后端仓库**: [accountManage](https://github.com/wo1261931780/accountManage)
- **后端端口**: 8080 (默认)
- **API 前缀**: `/api/v1`

### 跨域配置

后端已配置 CORS 支持，允许前端跨域访问。如需修改，请参考后端项目的 `CorsConfig.java`。

---

## 📦 构建部署

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

### 部署到 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;

    # Vue Router History 模式支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理到后端
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🤝 相关项目

| 项目 | 说明 |
|------|------|
| [accountManage](https://github.com/wo1261931780/accountManage) | 后端 API 服务 (Spring Boot) |

---

## 📄 许可证

本项目采用 [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE) 开源许可证。

---

## 👨‍💻 作者

**wo1261931780**

- GitHub: [@wo1261931780](https://github.com/wo1261931780)