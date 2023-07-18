# Software Mansion Icon pack

## About the pack

Carefully designed SVG icons by our in-house design team to help you with icons in your projects. Completely free and
ready to use, as always in our case.

Visit [swmansion.com](https://swmansion.com) to download icon code library

by Daniel Wodziczka<br />
UI/UX Designer at Software Mansion

---

## Usage

These icons are duotone icons. HTML to render a typical size icon (equivalent of `1.5rem`):

```html
<svg width="24" height="24" aria-hidden="true">
	<use href="/icons/newscreen.svg#icon"></use>
</svg>
```

You can style the icon with CSS variables:

| CSS custom property   | Description                                                                                |
| :-------------------- | :----------------------------------------------------------------------------------------- |
| `--icon-stroke-color` | Primary color, the icon lines. Defaults to `currentColor`.                                 |
| `--icon-shade-color`  | Secondary color on supporting icons to highlight a background piece. Defaults to no color. |

Check [Icon.astro](../../src/components/Icon.astro) for implementation details. Note that the implementation includes
support for [social icons](./social/README.md) as well.
