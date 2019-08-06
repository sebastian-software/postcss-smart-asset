import path from "path"

import { normalize } from "../lib/paths"

/**
 * Fix url() according to source (`from`) or destination (`to`)
 */
export function rebaseAsset(asset, dir) {
  const rebasedUrl = normalize(path.relative(dir.to, asset.absolutePath))
  return `${rebasedUrl}${asset.search}${asset.hash}`
}
