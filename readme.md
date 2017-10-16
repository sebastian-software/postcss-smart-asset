# PostCSS Smart Asset<br/>[![Sponsored by][sponsor-img]][sponsor] [![Version][npm-version-img]][npm] [![Downloads][npm-downloads-img]][npm] [![Build Status Unix][travis-img]][travis] [![Build Status Windows][appveyor-img]][appveyor] [![Dependencies][deps-img]][deps]

[sponsor-img]: https://img.shields.io/badge/Sponsored%20by-Sebastian%20Software-692446.svg
[sponsor]: https://www.sebastian-software.de
[deps]: https://david-dm.org/sebastian-software/postcss-smart-asset
[deps-img]: https://david-dm.org/sebastian-software/postcss-smart-asset.svg
[npm]: https://www.npmjs.com/package/postcss-smart-asset
[npm-downloads-img]: https://img.shields.io/npm/dm/postcss-smart-asset.svg
[npm-version-img]: https://img.shields.io/npm/v/postcss-smart-asset.svg
[travis-img]: https://img.shields.io/travis/sebastian-software/postcss-smart-asset/master.svg?branch=master&label=unix%20build
[appveyor-img]: https://img.shields.io/appveyor/ci/swernerx/postcss-smart-asset/master.svg?label=windows%20build
[travis]: https://travis-ci.org/sebastian-software/postcss-smart-asset
[appveyor]: https://ci.appveyor.com/project/swernerx/postcss-smart-asset/branch/master

[PostCSS](https://github.com/postcss/postcss) plugin to rebase, inline or copy on url().



## Installation

```console
$ npm install postcss-smart-asset
```



## Changes over [PostCSS-URL](https://github.com/postcss/postcss-url)

- Changed output of relative URLs so that the harmonize with Webpack. This mainly means that in Webpack world it is pretty common to use relative URLs even inside CSS e.g. use `url(./myfile.gif)` instead of `url(myfile.gif)`. The last syntax actually lead to some issue during Webpack processing as Webpack would assume that you are referencing an *npm* package called `myfile.gif` which is probably not what you thought to do.
- Converted whole test suite from Mocha + Chai to Jest. Made whole test suite asynchronous.
- Migrated source code to EcmaScript modules (ESM). Refactored internal structure.
- Replaced custom eslint definitions with [readable-code](https://github.com/sebastian-software/readable-code).
- Dropped Node v4 support. Added Node v6 and v8 to CI suite.
- Restructured tests to be side-by-side with implementation code.
- Use of [prepublish](https://github.com/sebastian-software/prepublish) instead of custom release logic. Offering a ESM bundle now as well.



## Basic example - rebase

```js
// dependencies
const fs = require("fs")
const postcss = require("postcss")
const smartAsset = require("postcss-smart-asset")

// css to be processed
const css = fs.readFileSync("input.css", "utf8")

// process css
const output = postcss()
  .use(smartAsset({
    url: "rebase"
  }))
  .process(css, {
    from: "src/stylesheet/index.css",
    to: "dist/index.css"
  })
```
before:
```css
.element {
    background: url('images/sprite.png');
}
```
after:
```css
.element {
    /* rebasing path by new destination */
    background: url('../src/stylesheet/images/sprite.png');
}
```


## Inline

```js
const options = {
    url: 'inline'
};

postcss()
  .use(smartAsset(options))
  .process(css, {
    from: "src/stylesheet/index.css",
    to: "dist/index.css"
  })
```
before:

```css
.element {
    background: url('/images/sprite.png');
    filter: url('/images/circle.svg');
}
```

after:

```css
.element {
    /* inlined png as base64 */
    background: url('data:image/png;base64,R0lGODlhAQABAJH/AP///wAAAP///wAAACH/C0FET0JFOklSMS4');
    /* inlined svg as encodeURIComponent */
    filter: url('data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%2F%3E');
}
```

## Copy

```js
const options = {
    url: 'copy',
    // base path to search assets from
    basePath: path.resolve('node_modules/bootstrap'),
    // dir to copy assets
    assetsPath: 'img',
    // using hash names for assets (generates from asset content)
    useHash: true
};

postcss()
  .use(smartAsset(options))
  .process(css, {
    from: "src/stylesheet/index.css",
    to: "dist/index.css"
  })
```
before:
```css
.element {
    background: url('/images/sprite.png');
}
```
after:
```css
.element {
    /* copy 'sprite.png' from 'node_modules/bootstrap/images/' to 'dist/img/' */
    /* and rename it by hash function */
    background: url('img/a2ds3kfu.png');
}
```

### Muiltiple options

process first matched option by default.
```multi: true``` in `custom` will processing with other options

```js
const options = [
    { filter: '**/assets/copy/*.png', url: 'copy', assetsPath: 'img', useHash: true },
    { filter: '**/assets/inline/*.svg', url: 'inline' },
    { filter: '**/assets/**/*.gif', url: 'rebase' },
    // using custom function to build url
    { filter: 'cdn/**/*', url: (asset) => `https://cdn.url/${asset.url}` }
];

postcss().use(smartAsset(options))
```

Checkout [tests](test) for examples.

### Options combinations

* `rebase` - _default_
* `inline`
  * `basePath` - path or array of paths to search assets (relative to `from`, or absolute)
  * `encodeType` - `base64`, `encodeURI`, `encodeURIComponent`
  * `includeUriFragment` - include the fragment identifer at the end of the URI
  * `maxSize` - file size in kbytes
  * `fallback` - `copy` or custom function for files > `maxSize`
  * `ignoreFragmentWarning` - do not warn when an SVG URL with a fragment is inlined
  * `optimizeSvgEncode` - reduce size of inlined svg (IE9+, Android 3+)
* `copy`
    * `basePath` - path or array of paths to search assets (relative to `from`, or absolute)
    * `assetsPath` - directory to copy assets (relative to `to` or absolute)
    * `useHash` - use filehash(xxhash) for naming
    * `hashOptions` - options for hash function
* `custom {Function}`
    * `multi` - processing with other options

### Options list

#### `url`

##### `rebase` - _(default)_

Allow you to fix `url()` according to postcss `to` and/or `from` options (rebase to `to` first if available, otherwise `from` or `process.cwd()`).

##### `inline`

Allow you to inline assets using base64 encoding. Can use postcss `from` option to find ressources.

##### `copy`

Allow you to copy and rebase assets according to postcss `to`, `assetsPath` and `from` options (`assetsPath` is relative to the option `to`).

##### `url: {Function}`

Custom transform function. Takes following arguments:
* `asset`
  * `url` - original url
  * `pathname` - url pathname (url without search or hash)
  * `absolutePath` - absolute path to asset
  * `relativePath` - current relative path to asset
  * `search` - _search_ from `url`, ex. `?query=1` from `./image.png?query=1`
  * `hash` - _hash_ from `url`, ex. `#spriteLink` from `../asset.svg#spriteLink`
* `dir`
  * `from` - PostCSS option from
  * `to` - PostCSS option to
  * `file` - decl file path
* `options` - plugin options
* `decl` - related postcss declaration object
* `warn` - wrapped function `result.warn` for current `decl`
* `result` – PostCSS result object

And should return the transformed url.
You can use this option to adjust urls for CDN.

#### `maxSize`

_(default: `14`)_

Specify the maximum file size to inline (in kbytes)

#### `ignoreFragmentWarning`

_(default: `false`)_

Do not warn when an SVG URL with a fragment is inlined.
PostCSS-URL does not support partial inlining.  The entire SVG file will be inlined.  By default a warning will be issued when this occurs.

**NOTE:** Only files less than the maximum size will be inlined.

#### `filter`

A regular expression e.g. `/\.svg$/`, a [minimatch string](https://github.com/isaacs/minimatch) e.g. `'**/*.svg'` or a custom filter function to determine wether a file should be inlined.

#### `fallback`

The url fallback method to use if max size is exceeded or url contains a hash.
Custom transform functions are supported.

#### `includeUriFragment`

_(default: `false`)_

Specifies whether the URL's fragment identifer value, if present, will be added
to the inlined data URI.

#### `basePath`

Specify the base path or list of base paths where to search images from

#### `assetsPath`

_(default: `false`)_

If you specify an `assetsPath`, the assets files will be copied in that
destination

#### `useHash`

_(default: `false`)_

If set to `true` the copy method is going to rename the path of the files by a hash name

#### `hashOptions`

##### `method`

_(default: `xxhash32`)_

Hash method `xxhash32|xxhash64` or custom function (accept file buffer)

##### `shrink`

_(default: `8`)_

Result hash shrink count



## License

[Apache License Version 2.0, January 2004](license)

## Copyright

<img src="https://raw.githubusercontent.com/sebastian-software/readable-code/master/assets/sebastiansoftware.png" alt="Sebastian Software GmbH Logo" width="250" height="200"/>

Copyright 2014<br/>Maxime Thirouin<br/><br/>
Copyright 2017<br/>[Sebastian Software GmbH](http://www.sebastian-software.de)
