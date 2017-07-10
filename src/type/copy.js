import path from "path"
import fs from "fs"
import mkdirp from "mkdirp"
import calcHash from "../lib/hash"
import { getTargetDir, getAssetsPath, normalize } from "../lib/paths"
import getFile from "../lib/get-file"

const getHashName = (file, options) => calcHash(file.contents, options) + path.extname(file.path)

/**
 * Copy images from readed from url() to an specific assets destination
 * (`assetsPath`) and fix url() according to that path.
 * You can rename the assets by a hash or keep the real filename.
 *
 * Option assetsPath is require and is relative to the css destination (`to`)
 *
 * @type {PostcssUrl~UrlProcessor}
 * @param {PostcssUrl~Asset} asset
 * @param {PostcssUrl~Dir} dir
 * @param {PostcssUrl~Option} options
 * @param {PostcssUrl~Decl} decl
 * @param {Function} warn
 * @param {Result} result
 * @param {Function} addDependency
 *
 * @returns {String|Undefined}
 */
export default function processCopy(asset, dir, options, decl, warn, result, addDependency) {
  if (!options.assetsPath && dir.from === dir.to) {
    warn("Option `to` of postcss is required, ignoring")

    return
  }

  const file = getFile(asset, options, dir, warn)

  if (!file) return

  const assetRelativePath = options.useHash ? getHashName(file, options.hashOptions) : asset.relativePath

  const targetDir = getTargetDir(dir)
  const newAssetBaseDir = getAssetsPath(targetDir, options.assetsPath)
  const newAssetPath = path.join(newAssetBaseDir, assetRelativePath)
  const newRelativeAssetPath = normalize(path.relative(targetDir, newAssetPath))

  mkdirp.sync(path.dirname(newAssetPath))

  if (!fs.existsSync(newAssetPath)) {
    fs.writeFileSync(newAssetPath, file.contents)
  }

  addDependency(file.path)

  return `${newRelativeAssetPath}${asset.search}${asset.hash}`
}
