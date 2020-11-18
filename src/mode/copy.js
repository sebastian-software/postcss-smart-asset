import path from "path"
import { copyFile, mkdir } from "fs/promises"

import { getHashedName } from "asset-hash"

import getFile from "../core/getFile"
import { getAssetsPath, getTargetDir, normalize } from "../core/paths"

const getHashName = (file, options) => getHashedName(file.path, options)

/**
 * Copy images from readed from url() to an specific assets destination
 * (`assetsPath`) and fix url() according to that path.
 * You can rename the assets by a hash or keep the real filename.
 *
 * Option assetsPath is require and is relative to the css destination (`to`)
 */
export async function copyAsset(asset, dir, options, decl, warn, result, addDependency) {
  if (!options.assetsPath && dir.from === dir.to) {
    warn("Option `to` of postcss is required, ignoring")

    return
  }

  const file = getFile(asset, options, dir, warn)

  if (!file) {
    return
  }

  addDependency(file.path)

  let assetRelativePath = options.useHash
    ? await getHashName(file, options.hashOptions)
    : asset.relativePath
  if (options.useHash && options.keepName) {
    const pathObj = path.parse(assetRelativePath)

    const fileName = path.parse(asset.relativePath).name
    pathObj.name = `${fileName}~${pathObj.name}`
    delete pathObj.base // otherwise it would override name
    assetRelativePath = path.format(pathObj)
  }

  const targetDir = getTargetDir(dir)
  const newAssetBaseDir = getAssetsPath(targetDir, options.assetsPath)
  const newAssetPath = path.join(newAssetBaseDir, assetRelativePath)
  const newRelativeAssetPath = normalize(path.relative(targetDir, newAssetPath))

  await mkdir(path.dirname(newAssetPath), { recursive: true })
  await copyFile(file.path, newAssetPath)

  return `${newRelativeAssetPath}${asset.search}${asset.hash}`
}
