### My docs

## Usage
Usage is very simple. In the content folder you can find all the documentation. Adding or editing folders and the markdown files in there will automatically trigger a new build and generate those files as pages.
These pages will be added to the index based on the folder structure.

The `.mdx` files can contain both [markdown](https://www.markdownguide.org/)

### Meta tags
In the top of each markdown file you see this section:
```md
---
title: ESlint configuration standards
description: "What we use to lint our code"
layout: "index"
---
```
Meta tags are defined here as well as the layout that is used.

### Layouts
Layouts are defined in the layouts folder. The markdown content will be embedded in these layouts. When no specific layout is defined, the default layout will be applied. New layouts can be added in this folder, but will then need to be added to the switch in this `getLayout()` function:

```js
Page.getLayout = (page) => {
  const { layout } = page.props;

  switch (layout) {
    case 'index':
      return <IndexLayout>{page}</IndexLayout>
		case 'new-layout:
			return <NewLayout>{page}</NewLayout>
    default:
      return <Default>{page}</Default>;
  }
};

```

## Interface ideas
- [DevDocs API Documentation](https://devdocs.io/)
- [Style Guide — Vue.js](https://v2.vuejs.org/v2/style-guide/)

## Index
- Level 0
	- Level 1
		- Level 2
			- Level 3
				- etc.