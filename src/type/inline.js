import fs from "fs"

import encodeFile from "../lib/encode"
import getFile from "../lib/get-file"

import processCopy from "./copy"
import processRebase from "./rebase"

function processFallback(originUrl, dir, options) {
  if (typeof options.fallback === "function") {
    return options.fallback.apply(null, arguments)
  }

  switch (options.fallback) {
    case "copy":
      return processCopy(...arguments)
    case "rebase":
      return processRebase(...arguments)
    default:
  }
}

/**
 * Inline image in url()
 */
export default async function(asset, dir, options, decl, warn, result, addDependency) {
  const file = getFile(asset, options, dir, warn)

  if (!file) return

  if (!file.mimeType) {
    warn(`Unable to find asset mime-type for ${file.path}`)

    return
  }

  const maxSize = (options.maxSize || 0) * 1024

  // For some reason we can't use `const` for `stats` as this breaks
  // Babel v7 on Node v6. Re-evaluate in some month if fixed.
  // Log: https://travis-ci.org/sebastian-software/postcss-smart-asset/builds/408069998
  if (maxSize) {
    const stats = fs.statSync(file.path)

    if (stats.size >= maxSize) {
      return processFallback.apply(this, arguments)
    }
  }

  const isSvg = file.mimeType === "image/svg+xml"
  const defaultEncodeType = isSvg ? "encodeURIComponent" : "base64"
  const encodeType = options.encodeType || defaultEncodeType

  // Warn for svg with hashes/fragments
  if (isSvg && asset.hash && !options.ignoreFragmentWarning) {
    // eslint-disable-next-line max-len
    warn(
      `Image type is svg and link contains #. PostCSS Smart Asset can't handle SVG fragments. SVG file fully inlined. ${file.path}`
    )
  }

  addDependency(file.path)

  const optimizeSvgEncode = isSvg && options.optimizeSvgEncode
  const encodedStr = await encodeFile(file, encodeType, optimizeSvgEncode)
  const resultValue =
    options.includeUriFragment && asset.hash ? encodedStr + asset.hash : encodedStr

  // wrap url by quotes if percent-encoded svg
  return isSvg && encodeType !== "base64" ? `"${resultValue}"` : resultValue
}
