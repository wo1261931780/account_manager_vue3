# 多阶段构建 - 账号密码管理系统前端
# Stage 1: 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json 和 lock 文件
COPY frontend/package*.json ./

# 安装依赖
RUN npm ci --registry=https://registry.npmmirror.com

# 复制源代码
COPY frontend/ .

# 构建生产版本
RUN npm run build

# Stage 2: 运行阶段 - 使用 nginx
FROM nginx:alpine

LABEL maintainer="wo1261931780"
LABEL description="账号密码管理系统 - 前端服务"
LABEL version="1.5"

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
