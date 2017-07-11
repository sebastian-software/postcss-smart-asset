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
  let rebasedUrl = normalize(path.relative(dir.to, asset.absolutePath))

  // For Webpack compatibility as of v2.0.0 to v3.1.0 we need to prepend a relative path indicator.
  // Otherwise Webpack tries to interpret the url as a package from node_modules which is probably
  // no what we meant it to be.
  let wasExplicitelyLocal = asset.originUrl.charAt(0) === "." || asset.originUrl.charAt(0) === "/"
  if (wasExplicitelyLocal && rebasedUrl.charAt(0) !== "." && rebasedUrl.charAt(0) !== "/") {
    rebasedUrl = `./${rebasedUrl}`
  }

  return `${rebasedUrl}${asset.search}${asset.hash}`
}
