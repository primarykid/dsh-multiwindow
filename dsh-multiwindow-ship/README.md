# dsh-multiwindow

[中文](./README.md#中文)

**Multi-window chat grid for the DeepSeek Harness Web GUI** — see up to **6
live chat panes at once** in a responsive grid, with a slider when you pin more
than 6 sessions. Each pane is a full, independent conversation bound to its own
session (not the "current" selection), and pinned panes load the session's
**latest history** automatically.

This is a **patch-style release**: it contains the code change (as a git patch)
plus documentation, not the whole upstream source. Apply it onto a
`deepseek-harness` checkout version **0.1.0-rc.x** to enable the feature.

## Contents

| File | Purpose |
| --- | --- |
| `multi-window-grid.patch` | The whole feature as a `git` patch (23 files, incl. the history fix). |
| `MULTI_PANE_WIP.md` | Dev notes: what's implemented, verification, and the upstream merge checklist. |

## How to apply

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
git apply /path/to/multi-window-grid.patch   # or: git apply --index

pnpm install
pnpm run build:lib:client
pnpm --filter @deepseek-ai/dsh-web-frontend run build
pnpm dsh --profile web         # run the GUI from source
```

Then **hard-refresh** the page (`Cmd/Ctrl + Shift + R`). In the center-column
toolbar use **"＋ Add window…"** to pin a session; use **‹ ›** to slide when
more than 6 are pinned; close a pane with **×**.

> Applied bundle-level (the way it's deployed in a running install) is also
> possible: rebuild the three client packages (`runtime`, `web-react` actually
> ships in the frontend bundle, `ui-layout`) and the web frontend, and replace
> the installed `lib/client.js` + `dist/`.

## What changed

| Package | Change |
| --- | --- |
| `packages/client/runtime` | `sessions.infoFor(id)` (resolve any session's provide bundle) and `sessions.pinOpen(id)` (open a pinned session's history without changing selection). |
| `packages/client/web-react` | `SessionPinnedProvider` scopes a subtree to a specific session; `SessionProvider` follows the nearest binding so nested slots track their own pane. |
| `packages/client/ui-layout` | Multi-pane grid, pinned-sessions store (`GRID_SIZE = 6`), toolbar add/slide, per-pane close. |
| `packages/client/ui-slots` | `SlotRendererHost.sessions.infoFor` + `SessionPinnedProvider` seat types. |

## Limitations / upstream checklist

See [`MULTI_PANE_WIP.md`](./MULTI_PANE_WIP.md). Notable: UI copy is currently
English; snapshot/e2e tests, an Agent Note, and per-file coverage are still
needed before an upstream merge.

---

# 中文

**DeepSeek Harness Web 界面多窗口聊天网格** —— 在响应式网格里**同时最多查看 6
个实时聊天窗口**，钉选超过 6 个会话时可滑动分页。每个窗口都是绑定到各自会话的
完整独立对话（不依赖左侧"当前选中"），钉选的窗口会自动**加载该会话的最新历史**。

本仓库采用**补丁式发布**：只包含代码改动（git 补丁）和文档，不含上游源码。
把它套用到 **0.1.0-rc.x** 版本的 `deepseek-harness` 检出上即可启用该功能。

## 内容

| 文件 | 用途 |
| --- | --- |
| `multi-window-grid.patch` | 整个功能以 git 补丁形式给出（23 个文件，含历史修复）。 |
| `MULTI_PANE_WIP.md` | 开发说明：已实现内容、验证情况、上游合并清单。 |

## 如何应用

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
git apply /path/to/multi-window-grid.patch

pnpm install
pnpm run build:lib:client
pnpm --filter @deepseek-ai/dsh-web-frontend run build
pnpm dsh --profile web          # 从源码运行 GUI
```

然后**强制刷新**页面（`Cmd/Ctrl + Shift + R`）。在中间栏顶部工具栏用
**"＋ Add window…"（添加窗口）** 钉选会话；钉选超过 6 个用 **‹ ›** 滑动；
点窗口标题栏 **×** 关闭。

> 也可对正在运行的安装做编译产物级别的替换（重编译 runtime / `web-react`（并入
> 前端包）/ ui-layout 三个 client 包与前端 `dist/`，替换已安装的 `lib/client.js` 与 `dist/`）。

## 改动内容

| 包 | 改动 |
| --- | --- |
| `packages/client/runtime` | 新增 `sessions.infoFor(id)`（解析任意会话的 provide bundle）与 `sessions.pinOpen(id)`（不改变选中即可打开钉选会话历史）。 |
| `packages/client/web-react` | 新增 `SessionPinnedProvider` 把子树绑定到指定会话；`SessionProvider` 跟随最近的绑定，使嵌套插槽跟随各自窗口。 |
| `packages/client/ui-layout` | 多窗口网格、钉选会话 store（`GRID_SIZE = 6`）、工具栏添加/滑动、每窗口关闭。 |
| `packages/client/ui-slots` | `SlotRendererHost.sessions.infoFor` 与 `SessionPinnedProvider` 插槽类型。 |

## 限制 / 上游合并清单

见 [`MULTI_PANE_WIP.md`](./MULTI_PANE_WIP.md)。其中：界面文案目前为英文；合入
上游前仍需快照/e2e 测试、Agent Note 和逐文件覆盖率。
