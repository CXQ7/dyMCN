# 安装与部署指南

本指南适用于在本地开发与在生产环境部署 SI-Assistant（Vite + React + Tailwind）。

- 运行环境：Node.js ≥ 18（建议使用 Node 20 LTS）
- 包管理器：npm（已包含 package-lock.json，推荐使用 `npm ci` 保证一致性）

## 1. 获取代码

- 将项目代码放置在任意目录，例如：
  - /Users/<username>/Downloads/SI-Assistant

## 2. 安装依赖

首次安装（开发机）：

```
npm install
```

CI/生产构建（锁定依赖，避免漂移）：

```
npm ci
```

## 3. 本地开发

启动开发服务器（默认端口 5173，若被占用会自动递增为 5174 等）：

```
npm run dev
```

- 终端会显示访问地址，例如：
  - http://localhost:5173/ （或 http://localhost:5174/）

如需指定端口运行：

```
npm run dev -- --port 5174
```

## 4. 构建生产包

执行 TypeScript 检查并构建产物：

```
npm run build
```

构建成功后，静态文件位于 `dist/` 目录，可直接用于静态托管。

## 5. 本地预览生产包

使用 Vite 的内置预览服务器（默认 4173 端口）：

```
npm run preview
```

- 访问地址通常为 http://localhost:4173/

## 6. 生产环境部署（静态托管）

本项目为纯前端单页应用（SPA），部署时仅需提供静态文件服务，并配置“回退到 index.html”。常见方式：

### 6.1 Nginx

- 将 `dist/` 中的文件部署至服务器目录（例如 /var/www/si-assistant）。
- 参考示例配置：

```
server {
  listen 80;
  server_name your.domain.com;
  root /var/www/si-assistant;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(js|css|svg|woff2?)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
}
```

更新后重载 Nginx：

```
sudo nginx -s reload
```

### 6.2 对象存储 + CDN（如 S3/OSS + CloudFront/CDN）

- 将 `dist/` 上传至对象存储 Bucket 的发布目录。
- 配置 CDN 加速与缓存策略。
- 开启默认首页与错误页（均指向 `index.html`），以支持 SPA 路由回退。

### 6.3 Vercel / Netlify

- 选择 Import 项目。
- Build 命令：`npm run build`
- Publish 目录：`dist`
- 其他参数保持默认即可。

## 7. 自定义部署路径（子路径部署）

若需将应用部署到子路径（例如 `https://your.domain.com/si/`），请在构建前设置 Vite `base`：

- 方式一：在 `vite.config.ts` 中配置 `base: '/si/'`。
- 方式二：通过环境变量或命令参数指定：

```
vite build --base=/si/
```

确保服务器也将该子路径指向 `dist` 内容，并使用 `index.html` 回退。

## 8. 常见问题与排查

- 端口占用：
  - 开发端口默认 5173，被占用将自动 +1。也可通过 `npm run dev -- --port 5174` 指定。
- 构建后空白页或 404：
  - 静态服务器需要对任意路由回退到 `index.html`，请检查 Nginx/托管平台的 SPA 回退配置。
- 样式未生效或与设计不符：
  - 确保 `src/index.css` 引入了 `styles/globals.css`，并包含 Tailwind 指令。
  - Tailwind 扫描路径已在 `tailwind.config.ts` 配置（`./src`, `./components`, `./pages` 等）。
  - 若生产环境使用子路径部署，请正确设置 `base`，避免资源路径 404。
- Node 版本问题：
  - 确保 Node.js ≥ 18，建议使用 Node 20 LTS。可以使用 nvm 切换版本。

## 9. 目录结构（节选）

- `src/`：入口与应用启动
- `components/`：通用 UI 组件与业务组件
- `pages/`：页面级组件
- `styles/globals.css`：全局 CSS 变量与基础样式
- `tailwind.config.ts`：Tailwind 配置
- `vite.config.ts`：Vite 构建配置
- `dist/`：生产构建产物（构建后生成）

—— 以上即为 SI-Assistant 的安装与部署指引。