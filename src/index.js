import path from "path"

import { Declaration } from "postcss"

import { declProcessor } from "./core/declProcessor"

export default (options = {}) => ({
  postcssPlugin: "postcss-smart-asset",
  Declaration(decl, { result }) {
    const opts = result.opts
    const from = opts.from ? path.dirname(opts.from) : "."
    const to = opts.to ? path.dirname(opts.to) : from

    return declProcessor(from, to, options, result, decl)
  }
})

// PostCSS v8 marker
export const postcss = true
