import path from "path"

import postcss from "postcss"

import { declProcessor } from "./core/declProcessor"

export default postcss.plugin("postcss-smart-asset", (options = {}) => (root, result) => {
  const opts = result.opts
  const from = opts.from ? path.dirname(opts.from) : "."
  const to = opts.to ? path.dirname(opts.to) : from

  const promises = []

  root.walkDecls((decl) => {
    const waiter = declProcessor(from, to, options, result, decl)
    if (waiter && waiter.then) {
      promises.push(waiter)
    }
  })

  return Promise.all(promises)
})
