import path from "path"
import fs from "fs"
import cpFile from "cp-file"
import { getTargetDir, getAssetsPath, normalize } from "../lib/paths"
import getFile from "../lib/get-file"
import { getHashedName } from "asset-hash"

const getHashName = (file, options) => getHashedName(file.path, options)

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
export default async function processCopy(asset, dir, options, decl, warn, result, addDependency) {
  if (!options.assetsPath && dir.from === dir.to) {
    warn("Option `to` of postcss is required, ignoring")

    return
  }

  const file = getFile(asset, options, dir, warn)

  if (!file) return

  addDependency(file.path)

  const assetRelativePath = options.useHash ? await getHashName(file, options.hashOptions) : asset.relativePath

  const targetDir = getTargetDir(dir)
  const newAssetBaseDir = getAssetsPath(targetDir, options.assetsPath)
  const newAssetPath = path.join(newAssetBaseDir, assetRelativePath)
  const newRelativeAssetPath = normalize(path.relative(targetDir, newAssetPath))

  await cpFile(file.path, newAssetPath, { overwrite: false })

  return `${newRelativeAssetPath}${asset.search}${asset.hash}`
}
