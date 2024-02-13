# split-css-rspack-plugin

## Install
```
npm i --save-dev split-css-rspack-plugin
```

## Features

- [x] Use `postcss` to split css file
- [ ] Parse css in various files besides html
- [ ] Multiple configuration `options`
- [ ] Use purgecss clean css

## Usage
```ts
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import {SplitCssPlugin} from "split-css-rspack-plugin"

export default defineConfig({
  plugins: [pluginReact()],
  tools: { 
    rspack: {
      plugins: [
        new SplitCssPlugin({cssFileNum:5}),
      ]
    }
  }
});

```