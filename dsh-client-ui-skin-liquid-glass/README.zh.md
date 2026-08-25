# @linxin666/dsh-client-ui-skin-liquid-glass

[English](README.md) | 中文

液态玻璃（Liquid Glass）是以 Apple Liquid Glass 设计语言重塑整个 dsh web GUI 的主题：中性黑色玻璃壁纸（亮色炭黑、暗色纯黑，刻意无色相，让玻璃读起来就是玻璃）垫在全视口玻璃之下，整个界面变成玻璃——半透明磨砂面板与气泡带背景模糊、白色玻璃描边，所有按钮与交互控件重塑为带顶部高光、底部辉光与内反射的液体胶囊，黑色底让胶囊的玻璃质感完全凸显。统一的荧光绿 #08ff08 作为品牌强调色贯穿文字与强调，紫色调彻底退场。

以客户端插件方式热插拔。`apply()` 设置 `data-dsh-liquid-glass` body 属性（整张样式表的作用域）、以固定全视口背景绘制黑色玻璃壁纸（纯 CSS 渐变，炭黑/纯黑随 `data-ds-dark-theme` 实时切换，零图片资源）、注入液态水滴 favicon（内联 SVG data URL）；effect disposer 全部收回：属性、背景内联样式（恢复原值）与 favicon。样式表随 bundle 的 CSS-modules 自动注入，入口卸载时由 loader 一并移除。

皮肤只做呈现：不注入服务、不发 cordis 事件、不触及模型请求。深色形态（`body[data-dsh-liquid-glass][data-ds-dark-theme]`）是同一块玻璃盖在纯黑底上——基础主题系统在底下照常工作。


## 从 GitHub 安装

仓库每个 Release 都附带预构建 tarball（`linxin666-dsh-client-ui-skin-liquid-glass-0.1.16.tgz`），源码包也会自行构建 `lib/`。

```sh
# 方式 A - 从 GitHub Release 下载 tarball 后：
dsh plugin --profile web add ./linxin666-dsh-client-ui-skin-liquid-glass-0.1.16.tgz

# 方式 B - 克隆本仓库，直接安装文件夹：
git clone https://github.com/primarykid/dsh-liquid-glass
cd dsh-client-ui-skin-liquid-glass
dsh plugin --profile web add .
```

`dsh plugin --profile web add <spec>` 是 `pnpm add` 在 web profile 上的薄封装——支持 tarball、本地路径或 npm/git 包。

然后**激活**：打开 web GUI -> 设置 -> 皮肤中心 -> 液态玻璃 -> 应用。皮肤中心会自动发现 `node_modules/@linxin666/dsh-client-ui-skin-*` 下已安装的皮肤包。命令行替代：`dsh-skin use liquid-glass`（若 PATH 上有辅助脚本）。

卸载：`dsh plugin --profile web remove @linxin666/dsh-client-ui-skin-liquid-glass`

源码构建：`pnpm install && pnpm build`（Node >= 22）。

## 安装（官方 bundle 方式）

推荐先装皮肤全家桶聚合包 `@linxin666/dsh-skins` 一次到位；只装本皮肤时用下列 link 命令。

```sh
# 装全部皮肤（推荐）
dsh plugin --profile web add @linxin666/dsh-skins
# 或单独装本皮肤
dsh plugin --profile web add @linxin666/dsh-client-ui-skin-liquid-glass
# 皮肤启用：dsh-skin use liquid-glass
# 从仓库安装（开发调试）：dsh plugin --profile web add link:$(pwd)/packages/skins/liquid-glass
```

`$(pwd)` 指克隆全家桶仓库后的目录。

本地 link 安装前需先在全家桶仓库内构建产物（`lib/` 被 git 忽略、不随仓库提交）：
`pnpm install && pnpm -r build` 后再 link 安装。
通过 git 安装（`dsh plugin --profile web add github:<org>/dsh-web-ui#<sha>`）时
`prepare` 脚本自动自包含构建 `lib/`，无需单独构建；pnpm ≥10 首次安装 git 依赖需先把
pnpm 打印的包键加入相应 profile 的 `pnpm-workspace.yaml` 的 `allowBuilds` 列表再重试。

## 玻璃配方

- **壁纸**：`apply()` 用纯 CSS 渐变在 body 上绘制黑色玻璃壁纸（亮色炭黑、暗色纯黑两套），皮肤零图片资源。
- **表面**：token 重映射把大面积面板变半透明（侧栏填充、图层栈、菜单、输入框、气泡），
  叶级表面——按钮、输入框、气泡、卡片、菜单、弹层、对话框、aionui 列、git-graph 对话框——
  额外加 `backdrop-filter: blur(...) saturate(...)`。
- **液体胶囊**：所有真实按钮变成胶囊形（`border-radius: 999px`），白玻璃描边、经 `::after`
  叠加的内凹顶部高光（组件自身的 box-shadow 覆盖不掉）、柔和的彩色投影辉光、悬停抬起并加强辉光、
  按下如按进液态的 pressed 态。文本标签页（tab）保持纯文本不玻璃化。

## 模糊纪律

`backdrop-filter` 只用在叶级表面与 portal 弹层上。侧栏列与大滚动容器不模糊：ui-settings
面板是侧栏列的 fixed 后代，任何祖先模糊都会把该面板重新锚定（whale-song 踩过的坑）。
输入停靠区的滚动渐隐只做在座位自身的 `::before` 上，绝不做在座位上——git-graph 的
popover 遮罩与图对话框是座位的 fixed 后代。

## 预览

亮色（[preview/light.png](preview/light.png)）· 暗色（[preview/dark.png](preview/dark.png)）。

## 兼容性

半透明全部走 token 层（`--dsw-alias-bg-*`、`--dsw-specific-*`、`--aion-*`），与面板布局无关，
并覆盖读取 shell token 的插件家族面板（aionui、git-graph、task-board、ssh、live-stats）。

## 模型体验

无。皮肤只改浏览器 DOM，不触及任何模型请求。

#### KV Cache 影响

无；本包既不组装也不发送任何 provider 请求。
