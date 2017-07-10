import path from "path"
import { normalize } from "../lib/paths"

/**
 * Fix url() according to source (`from`) or destination (`to`)
 *
 * @type {PostcssUrl~UrlProcessor}
 * @param {PostcssUrl~Asset} asset
 * @param {PostcssUrl~Dir} dir
 *
 * @returns {String|Undefined}
 */
export default function(asset, dir) {
  const rebasedUrl = normalize(path.relative(dir.to, asset.absolutePath))

  return `${rebasedUrl}${asset.search}${asset.hash}`
}
