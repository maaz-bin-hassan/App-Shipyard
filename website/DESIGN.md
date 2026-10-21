# App Shipyard website design

Tokens for the App Shipyard site. Components use these values and nothing outside them.

## Color

Surfaces and text are warm neutrals. One accent is used only for links, focus rings, the primary button, and the active nav item.

The light accent is not the sample `#E8590C`. That orange is 3.43:1 on `#FAFAF8` and 3.19:1 on `#F2F2EE`, below WCAG AA for normal text (4.5:1). `#BF4605` is the same hue, darkened until it clears 4.5:1 on both light surfaces. Button labels use a neutral, not a second hue.

| Token | Light | Dark |
| --- | --- | --- |
| bg | `#FAFAF8` | `#0E0E0D` |
| surface | `#F2F2EE` | `#161614` |
| border | `#E4E4DE` | `#2A2A27` |
| text | `#1A1A18` | `#ECECE8` |
| muted | `#6B6B64` | `#9A9A92` |
| accent | `#BF4605` | `#FF7A2E` |
| accent-contrast | `#FAFAF8` | `#0E0E0D` |

Measured contrast:

| Pair | Ratio |
| --- | --- |
| `#BF4605` on `#FAFAF8` | 4.91:1 |
| `#BF4605` on `#F2F2EE` | 4.57:1 |
| `#FAFAF8` on `#BF4605` | 4.91:1 |
| `#6B6B64` on `#FAFAF8` | 5.14:1 |
| `#6B6B64` on `#F2F2EE` | 4.78:1 |
| `#1A1A18` on `#FAFAF8` | 16.68:1 |
| `#FF7A2E` on `#0E0E0D` | 7.43:1 |
| `#FF7A2E` on `#161614` | 6.97:1 |
| `#0E0E0D` on `#FF7A2E` | 7.43:1 |
| `#9A9A92` on `#0E0E0D` | 6.82:1 |
| `#ECECE8` on `#0E0E0D` | 16.31:1 |

`#1A1A18` on `#BF4605` is 3.40:1, so light-mode primary buttons use `#FAFAF8` text. `#ECECE8` on `#FF7A2E` is 2.20:1, so dark-mode primary buttons use `#0E0E0D` text.

Colors are CSS variables on `:root`, switched by a `light` or `dark` class on `<html>`. Default follows the system preference. A nav control stores the choice in `localStorage`. An inline script in `<head>` applies the class before paint.

Solid colors only. No gradients.

## Type

Self-hosted through `next/font`. Geist Sans for UI and prose. Geist Mono for code and the wordmark. No other fonts. No runtime requests to a font host.

| Role | Size | Weight | Notes |
| --- | --- | --- | --- |
| Meta, code | 14px | 400 | Mono for code |
| UI body | 16px | 400 | |
| Prose | 17px | 400 | Line-height 1.65, max-width 68ch |
| Lead | 18px | 400 | |
| Section heading | 24px | 600 | Left-aligned |
| Page heading | 32px | 600 | Left-aligned |
| Hero | 48px | 600 | Hero only. 32px below 768px so the line fits. Tight tracking. |

## Spacing

8px grid. Section padding is 56px on small screens and 88px from 768px up. Landing column max-width 1080px. Prose column max-width 68ch. Text is left-aligned.

## Radius

6px on controls and code blocks. 10px on cards. Nothing larger.

## Structure

1px borders in the border token. No shadows. Popovers are not used. Hover on a card changes the border color only.

## Motion

Terminal replay, 150ms color and border transitions, and smooth anchor scrolling. Nothing else. `prefers-reduced-motion: reduce` disables the replay, the cursor blink, the transitions, and smooth scrolling.

## Banned

Treat any of these in the site as a build failure:

- Any gradient (background, text, border, or glow), mesh blobs, aurora effects, noise textures
- Glassmorphism, backdrop-blur panels, neon glows, drop-shadow stacks
- Stock illustrations, 3D renders, abstract blob art, emoji used as icons, AI-generated imagery
- Three-column feature cards with an icon in a colored square, bento grids
- Fake social proof: testimonials, logo walls, star counts, user numbers, "trusted by"
- Centered-everything layouts, giant rounded pills, oversized badges ("New!", "Beta") unless true
- Copy, layout, or assets taken from a commercial kit's site
- A claim about a feature that is not in this repository
