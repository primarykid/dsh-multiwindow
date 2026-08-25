/**
 * liquid-glass skin — the《液态玻璃》(Liquid Glass) Apple Liquid Glass theme,
 * a hot-pluggable client plugin for the dsh web GUI. apply() owns the whole
 * ambient surface and retracts it on dispose (the ThemePresenter retraction
 * discipline: the plugin only ever removes what it wrote): the
 * `data-dsh-liquid-glass` body attribute the stylesheet is scoped on, the
 * black glass wallpaper painted on the body (a neutral silver canvas in
 * light mode, a near-black canvas in dark mode — swapped live on
 * `data-ds-dark-theme` changes), and the injected favicon: a liquid glass
 * droplet mark as an inline SVG data URL (the only image the skin needs —
 * the wallpaper and every glass surface are pure CSS, no art assets).
 *
 * The glass surface itself is carried by the stylesheet: translucent
 * token fills + backdrop blur on leaf surfaces (buttons, inputs, bubbles,
 * cards, menus, portaled dialogs) with the whale-song no-blur discipline —
 * the sidebar column and big scroll containers stay blur-free because the
 * ui-settings panel renders as a fixed-position descendant of the sidebar
 * column, and a backdrop-filter on any ancestor would trap it.
 * @module @linxin666/dsh-client-ui-skin-liquid-glass
 */
import type { Context } from '@deepseek-ai/cordis'
// The palette remap + glass surfaces + liquid capsule buttons ride this
// stylesheet; the bundle preset inlines it as a loader-owned
// <style data-plugin-css> tag, removed on entry dispose.
import './liquid-glass.module.css'

/** Light wallpaper: a deep charcoal-black glass canvas — reads as black,
 *  with only a whisper of cool ambient light so the frosted surfaces have
 *  something to refract. Slightly lighter than the dark variant so the
 *  theme toggle still shifts the mood. No hue anywhere. */
const WALLPAPER_LIGHT = [
  'radial-gradient(1200px 820px at 12% 8%, rgba(148, 158, 196, 0.16), transparent 62%)',
  'radial-gradient(1050px 760px at 88% 14%, rgba(134, 146, 184, 0.12), transparent 62%)',
  'radial-gradient(980px 900px at 58% 96%, rgba(140, 152, 190, 0.14), transparent 60%)',
  'radial-gradient(760px 720px at 96% 82%, rgba(144, 156, 194, 0.10), transparent 58%)',
  'linear-gradient(160deg, #14171f 0%, #0d0f15 55%, #12141c 100%)',
].join(', ')

/** Dark wallpaper: a black glass canvas — near-black with only a whisper of
 *  cool ambient light so the frosted surfaces have something to refract.
 *  Reads as black at a glance; the liquid capsules' specular edges pop
 *  against it. No hue, no aurora. */
const WALLPAPER_DARK = [
  'radial-gradient(1200px 820px at 12% 8%, rgba(122, 134, 172, 0.13), transparent 62%)',
  'radial-gradient(1050px 760px at 88% 14%, rgba(104, 116, 154, 0.10), transparent 62%)',
  'radial-gradient(980px 900px at 58% 96%, rgba(112, 124, 162, 0.12), transparent 60%)',
  'radial-gradient(760px 720px at 96% 82%, rgba(118, 130, 168, 0.09), transparent 58%)',
  'linear-gradient(160deg, #0d0f15 0%, #05060a 55%, #0b0d12 100%)',
].join(', ')

/** Liquid droplet favicon: a capsule with a specular highlight, drawn as an
 *  inline SVG data URL — the only asset the skin ships. */
const DROPLET_ICON = [
  'data:image/svg+xml,',
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
    + '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
    + '<stop offset="0" stop-color="#08ff08"/><stop offset="0.5" stop-color="#08ff08"/>'
    + '<stop offset="1" stop-color="#08ff08"/></linearGradient></defs>'
    + '<rect x="6" y="6" width="52" height="52" rx="26" fill="url(#g)"/>'
    + '<rect x="6" y="6" width="52" height="52" rx="26" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.5"/>'
    + '<ellipse cx="22" cy="20" rx="10" ry="6.5" fill="rgba(255,255,255,0.75)" transform="rotate(-24 22 20)"/>'
    + '<ellipse cx="42" cy="44" rx="12" ry="7" fill="rgba(255,255,255,0.28)" transform="rotate(-24 42 44)"/>'
    + '</svg>',
  ),
].join('')

const BACKDROP_PROPERTIES = [
  'background-image',
  'background-position',
  'background-size',
  'background-attachment',
  'background-repeat',
] as const

/**
 * Apply the liquid-glass skin: body attribute, black glass wallpaper (swapped
 * live on theme flips), favicon. All writes are retracted by the effect
 * disposer on dispose. Backdrop writes go through the canonical hyphenated
 * CSSOM API (setProperty/getPropertyValue), so any prior value round-trips
 * verbatim on restore.
 * @param ctx - owning context (the effect lifecycle owns retraction).
 */
export function apply(ctx: Context): void {
  const body = document.body
  const previous = new Map<string, string>()
  for (const prop of BACKDROP_PROPERTIES) {
    previous.set(prop, body.style.getPropertyValue(prop))
  }
  body.dataset.dshLiquidGlass = ''

  const setWallpaper = (): void => {
    const dark = body.dataset.dsDarkTheme !== undefined
    body.style.setProperty('background-image', dark ? WALLPAPER_DARK : WALLPAPER_LIGHT)
    body.style.setProperty('background-position', 'center')
    body.style.setProperty('background-size', 'cover')
    body.style.setProperty('background-attachment', 'fixed')
    body.style.setProperty('background-repeat', 'no-repeat')
  }
  setWallpaper()

  // Swap the wallpaper live when the base theme system flips dark/light.
  const observer = new MutationObserver(setWallpaper)
  observer.observe(body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })

  const favicon = document.createElement('link')
  favicon.rel = 'icon'
  favicon.type = 'image/svg+xml'
  favicon.href = DROPLET_ICON
  document.head.append(favicon)

  ctx.effect(() => () => {
    delete body.dataset.dshLiquidGlass
    observer.disconnect()
    for (const [prop, value] of previous) {
      body.style.setProperty(prop, value)
    }
    favicon.remove()
  }, 'ui-skin-liquid-glass: black glass wallpaper')
}
