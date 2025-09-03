# 项目部署指南 (Deployment Guide)

## 📋 项目概述
这是一个基于 React + TypeScript + Firebase 的待办事项管理应用。

## 🚀 本地开发环境配置

### 1. 环境要求
- Node.js 18+ (推荐使用 Node.js 20.x)
- npm 或 yarn
- Git (可选)

### 2. 项目设置步骤

#### 步骤 1: 解压并进入项目目录
```bash
# 解压下载的 ZIP 文件
# 进入项目目录
cd job_info
```

#### 步骤 2: 安装依赖
```bash
npm install
```

#### 步骤 3: 配置环境变量
1. 复制环境变量模板文件：
```bash
cp .env-example .env
```

2. 编辑 `.env` 文件，填入你的 Firebase 配置信息：
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com/
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### 步骤 4: Firebase 配置
1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 创建新项目或使用现有项目
3. 启用 Realtime Database
4. 设置数据库规则（开发环境可以使用以下规则）：
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
5. 获取项目配置信息并填入 `.env` 文件

#### 步骤 5: 启动开发服务器
```bash
npm run dev
```

项目将在 `http://localhost:5173` 启动。

### 3. 项目结构说明
```
job_info/
├── src/
│   ├── components/     # React 组件
│   ├── hooks/          # 自定义 Hooks
│   ├── lib/            # 工具库和配置
│   ├── pages/          # 页面组件
│   ├── types/          # TypeScript 类型定义
│   └── utils/          # 工具函数
├── public/             # 静态资源
├── .env                # 环境变量配置
├── package.json        # 项目依赖
└── vite.config.ts      # Vite 配置
```

## 🌐 Vercel 部署指南

### 方法一: 通过 Vercel CLI 部署

#### 步骤 1: 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 步骤 2: 登录 Vercel
```bash
vercel login
```

#### 步骤 3: 部署项目
```bash
# 在项目根目录执行
vercel
```

按照提示完成配置：
- 选择项目名称
- 确认项目设置
- 等待部署完成

#### 步骤 4: 配置环境变量
在 Vercel 仪表板中：
1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加所有 `.env` 文件中的变量（不包括 `.env` 文件本身）

### 方法二: 通过 Vercel 网站部署

#### 步骤 1: 上传到 GitHub
1. 在 GitHub 创建新仓库
2. 将项目代码推送到仓库：
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### 步骤 2: 连接 Vercel
1. 访问 [Vercel](https://vercel.com/)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择你的 GitHub 仓库
5. 配置项目设置：
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

#### 步骤 3: 配置环境变量
在部署配置页面添加环境变量：
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

#### 步骤 4: 部署
点击 "Deploy" 按钮，等待部署完成。

## 🔧 常见问题解决

### 1. 依赖安装失败
```bash
# 清除 npm 缓存
npm cache clean --force
# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json
# 重新安装
npm install
```

### 2. Firebase 连接错误
- 检查 `.env` 文件中的配置是否正确
- 确认 Firebase 项目已启用 Realtime Database
- 检查数据库规则是否允许读写操作

### 3. 构建失败
```bash
# 检查 TypeScript 错误
npm run type-check
# 检查 ESLint 错误
npm run lint
```

### 4. Vercel 部署失败
- 确认所有环境变量都已正确设置
- 检查构建日志中的错误信息
- 确认 `package.json` 中的构建脚本正确

## 📝 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 🔒 安全注意事项

1. **不要提交 `.env` 文件到版本控制系统**
2. **生产环境请使用严格的 Firebase 安全规则**
3. **定期更新依赖包以修复安全漏洞**
4. **使用环境变量存储敏感信息**

## 📞 技术支持

如果在部署过程中遇到问题，请检查：
1. Node.js 版本是否符合要求
2. 网络连接是否正常
3. Firebase 配置是否正确
4. 环境变量是否完整

---

**祝你部署顺利！** 🎉