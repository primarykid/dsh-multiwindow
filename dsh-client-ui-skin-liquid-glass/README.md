# @linxin666/dsh-client-ui-skin-liquid-glass

English | [中文](README.zh.md)

液态玻璃 (Liquid Glass) is an Apple Liquid Glass design-language theme for the dsh web GUI: a neutral black glass wallpaper (deep charcoal in light mode, pure black in dark mode — deliberately colorless so the glass reads as glass) sits behind a translucent glass surface, and the whole interface turns into glass — frosted panes and bubbles with backdrop blur, white-glass edges, and every button / interactive control reshaped into a liquid capsule with a specular top highlight, a bottom glow and inner refraction. A uniform fluorescent green (#08ff08) becomes the sole accent hue across text, highlights and controls — no purple / indigo tint remains.

It is a hot-pluggable client plugin. `apply()` sets the `data-dsh-liquid-glass` body attribute (the whole stylesheet's scope), paints the black glass wallpaper as a fixed full-viewport backdrop (pure CSS gradients, charcoal/black swapped live on `data-ds-dark-theme` changes — no art assets), and injects a liquid-droplet favicon (inline SVG data URL). Its effect disposer retracts all of it: the attribute, the backdrop inline styles (restoring whatever was there before), and the favicon. The stylesheet ships inside the bundle via CSS-modules auto-inject, so the loader removes it when the entry is disposed.

The skin is presentation-only: no services are injected, no cordis events are emitted, nothing reaches a model request. The dark palette (`body[data-dsh-liquid-glass][data-ds-dark-theme]`) is the same glass over the black canvas, so the base theme system keeps working underneath.


## Install from GitHub

The repo ships a prebuilt tarball (`linxin666-dsh-client-ui-skin-liquid-glass-0.1.16.tgz`) in every release, and the source package builds `lib/` itself.

```sh
# Option A - grab the tarball from a GitHub release, then:
dsh plugin --profile web add ./linxin666-dsh-client-ui-skin-liquid-glass-0.1.16.tgz

# Option B - clone this repo and install the folder directly:
git clone https://github.com/primarykid/dsh-liquid-glass
cd dsh-client-ui-skin-liquid-glass
dsh plugin --profile web add .
```

`dsh plugin --profile web add <spec>` is a thin wrapper over `pnpm add` in your web profile - it accepts a tarball, a local path, or an npm/git spec.

Then **activate**: open the web GUI, go to Settings -> Skins (皮肤中心) -> 液态玻璃 -> Apply. The skin center auto-discovers installed skin packages under `node_modules/@linxin666/dsh-client-ui-skin-*`. CLI alternative: `dsh-skin use liquid-glass` (when the helper is on your PATH).

Uninstall: `dsh plugin --profile web remove @linxin666/dsh-client-ui-skin-liquid-glass`

Build from source: `pnpm install && pnpm build` (Node >= 22).

## Installing (official bundle)

Prefer the family aggregate package `@linxin666/dsh-skins` — every skin at once; for this skin alone, install with `link:`:

```sh
# All skins (recommended)
dsh plugin --profile web add @linxin666/dsh-skins
# Or just this skin
dsh plugin --profile web add @linxin666/dsh-client-ui-skin-liquid-glass
# Activate: dsh-skin use liquid-glass
# From the repo (dev): dsh plugin --profile web add link:$(pwd)/packages/skins/liquid-glass
```

`$(pwd)` is your clone of the dsh-web-ui monorepo.

A local `link:` install needs built artifacts first — `lib/` is git-ignored and not committed, so run `pnpm install && pnpm -r build` in the monorepo before linking. Git installs (`dsh plugin --profile web add github:<org>/dsh-web-ui#<sha>`) build `lib/` themselves via the `prepare` script; pnpm ≥10 blocks that until you copy the printed package key into the profile's `pnpm-workspace.yaml` `allowBuilds` list and re-run.

Activate or switch with `dsh-skin use liquid-glass` (helper script `scripts/dsh-skin` in the monorepo); only one skin is active at a time.

## The glass recipe

- **Wallpaper**: `apply()` paints a pure-CSS black glass canvas on the body (deep-charcoal light variant, pure-black dark variant), so the skin needs zero image assets.
- **Surfaces**: the token remap makes the big panes translucent (sidebar fill, layer stack, menus, inputs, bubbles), and leaf surfaces — buttons, inputs, bubbles, cards, menus, popovers, dialogs, the aionui columns, the git-graph dialog — additionally get `backdrop-filter: blur(...) saturate(...)`.
- **Liquid capsules**: every real button becomes a pill (`border-radius: 999px`) with no hard frame - a hairline rim and a top-lit gradient sheen via `::after` (surviving component `box-shadow` overrides), a soft drop glow, hover lift with an intensifying glow, and a pressed-into-liquid active state. Text tabs stay text labels.

## Blur discipline

`backdrop-filter` is applied only on leaf surfaces and portaled overlays. The sidebar column and big scroll containers stay blur-free: the ui-settings panel renders as a fixed-position descendant of the sidebar column, and a blurred ancestor would re-anchor that panel (the whale-song trap). The composer seat's scrolled-transcript fade frosts its own `::before`, never the seat itself — the git-graph popover backdrop and dialog are fixed descendants of the seat.

## Preview

Light ([preview/light.png](preview/light.png)) · Dark ([preview/dark.png](preview/dark.png)).

## Requirements

The ambient translucency is token-level (`--dsw-alias-bg-*`, `--dsw-specific-*`, `--aion-*`), so it applies regardless of pane layout and covers the plugin family panels (aionui, git-graph, task-board, ssh, live-stats) that read the shell tokens.

## Model Experience

None. The skin mutates only the browser DOM; nothing here reaches a model request.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.
