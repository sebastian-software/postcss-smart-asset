import path from "path"

import { Once } from "postcss"

import { declProcessor } from "./core/declProcessor"

export default (options = {}) => ({
    postcssPlugin: "postcss-dark-theme-class",
    Once(root, { result }) {
      const opts = result.opts
      const from = opts.from ? path.dirname(opts.from) : "."
      const to = opts.to ? path.dirname(opts.to) : from

      const promises = []

      root.walkDecls((decl) => {
        promises.push(declProcessor(from, to, options, result, decl))
      })

      return Promise.all(promises)
    }
  })

// PostCSS v8
export const postcss = true
