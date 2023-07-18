# Icons

These icons are multiple color social icons. By default they include the normal brand colors, but you may freely
override these colors.

## Usage

HTML to render a typical size icon (equivalent of `1.5rem`):

```html
<svg width="24" height="24" aria-hidden="true">
	<use href="/icons/social/rss.svg#icon"></use>
</svg>
```

You can style the icon with CSS variables:

| CSS custom property  | Description                                                                             |
| :------------------- | :-------------------------------------------------------------------------------------- |
| `--icon-color`       | The main icon color, overrides brand color.                                             |
| `--icon-light-color` | Color in the icon which is lighter than the main icon color, usually white.             |
| `--icon-dark-color`  | Color in the icon which is darker than the main icon color, usually black or dark grey. |

Check [Icon.astro](../../../src/components/Icon.astro) for implementation details. Note that the implementation includes
support for [other icons](../README.md) as well.
