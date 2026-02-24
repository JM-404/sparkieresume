# Resume AutoFill (Beta)

A Chrome extension for:
- maintaining a structured `profile.md`
- interview-style AI updates
- autofilling job application forms

This repo is currently for small-scale beta testing via Chrome Developer Mode.

## 中文说明（内测安装）

这是一个 Chrome 插件，主要功能：
- 维护结构化的 `profile.md`
- 通过采访式 AI 对话持续完善资料
- 在招聘网站自动填写表单

当前版本用于小范围内测，推荐通过 Chrome 开发者模式安装。

### 开发者模式安装步骤

1. 下载项目代码
- `git clone <你的仓库地址>`
- 或者直接下载 ZIP 并解压

2. 打开 Chrome 插件管理页
- 地址：`chrome://extensions/`

3. 打开右上角 `开发者模式`

4. 点击 `加载已解压的扩展程序（Load unpacked）`

5. 选择本项目目录
- `resume-autofill`

6. 固定并打开插件
- 在扩展管理中固定 `Resume AutoFill`
- 打开 popup，在 `Settings` 中配置模型与 API Key

### 更新到最新内测版本

1. 在本地目录拉取最新代码
2. 打开 `chrome://extensions/`
3. 在 `Resume AutoFill` 卡片上点击刷新按钮（Reload）

### 数据与隐私（内测）

- 你的 profile/chat/session 数据保存在本地 `chrome.storage.local`
- API Key 也保存在你本地浏览器配置中
- 本仓库不会自动把这些本地数据上传到 GitHub
- 仅会向你在 `Settings` 里配置的 LLM 接口发送请求

### 常见问题

- 页面无法自动填充：先刷新目标页面再重试
- `chrome://` 或插件页面属于受限页面，无法注入填充
- `file://` 页面需要在扩展详情中启用 “Allow access to file URLs”

## Install (Developer Mode)

1. Download this repo:
- `git clone <your-repo-url>`
- or download ZIP and unzip

2. Open Chrome extensions page:
- go to `chrome://extensions/`

3. Enable `Developer mode` (top-right switch).

4. Click `Load unpacked`.

5. Select this folder:
- `resume-autofill`

6. Pin and open extension:
- click extension icon, pin `Resume AutoFill`
- open popup to configure API key/model in `Settings`

## Update to latest beta

1. Pull latest code in this folder.
2. Go to `chrome://extensions/`.
3. Click the refresh/reload icon on `Resume AutoFill`.

## Data & Privacy (beta)

- Your profile/chat/session data is stored in `chrome.storage.local` on your own browser profile.
- API keys are also stored locally in extension settings.
- This repo does **not** upload your local browser storage to GitHub.
- LLM requests are sent to the provider endpoint you configure.

## Troubleshooting

- If autofill does not run on a page, refresh the page and retry.
- `chrome://` / extension pages are restricted and cannot be autofilled.
- For `file://` pages, enable “Allow access to file URLs” in extension details.
