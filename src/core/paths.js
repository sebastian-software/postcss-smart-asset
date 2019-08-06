import path from "path"
import url from "url"

/**
 * Normalizing result url, before replace decl value
 */
export const normalize = (assetUrl) => {
  assetUrl = path.normalize(assetUrl)

  if (path.sep === "\\") {
    assetUrl = assetUrl.replace(/\\/g, "/")
  }

  if (assetUrl.charAt(0) !== "." && assetUrl.charAt(0) !== "/") {
    assetUrl = `./${assetUrl}`
  }

  return assetUrl
}

export const isUrlWithoutPathname = (assetUrl) =>
  assetUrl[0] === "#" ||
  assetUrl.indexOf("%23") === 0 ||
  assetUrl.indexOf("data:") === 0 ||
  (/^[a-z]+:\/\//).test(assetUrl)

/**
 * Check if url is absolute, hash or data-uri
 */
export const isUrlShouldBeIgnored = (assetUrl, options) =>
  isUrlWithoutPathname(assetUrl) || (assetUrl[0] === "/" && !options.basePath)

export const getAssetsPath = (baseDir, assetsPath, relative) =>
  path.resolve(baseDir, assetsPath || "", relative || "")

/**
 * Target path, output base dir
 */
export const getTargetDir = (dir) => (dir.from !== dir.to ? dir.to : process.cwd())

/**
 * Stylesheet file path from decl
 */
export const getPathDeclFile = (decl) =>
  decl.source && decl.source.input && decl.source.input.file

/**
 * Stylesheet file dir from decl
 */
export const getDirDeclFile = (decl) => {
  const filename = getPathDeclFile(decl)

  return filename ? path.dirname(filename) : process.cwd()
}

/**
 * Returns paths list, where we can find assets file
 *
 * @param basePath - base paths where trying search to assets file
 * @param dirFrom
 * @param relPath - relative asset path
 */
export const getPathByBasePath = (basePath, dirFrom, relPath) => {
  if (relPath[0] === "/") {
    relPath = `.${relPath}`
  }

  basePath = !Array.isArray(basePath) ? [ basePath ] : basePath

  return basePath.map((pathItem) => getAssetsPath(dirFrom, pathItem, relPath))
}

/**
 * Preparing asset paths and data
 */
export const prepareAsset = (assetUrl, dir, decl) => {
  const parsedUrl = url.parse(assetUrl)
  const pathname = !isUrlWithoutPathname(assetUrl) ? parsedUrl.pathname : null
  const absolutePath = pathname ?
    path.resolve(path.join(dir.file, pathname)) :
    getPathDeclFile(decl)

  return {
    url: assetUrl,
    originUrl: assetUrl,
    pathname,
    absolutePath: absolutePath || dir.from,
    relativePath: absolutePath ? path.relative(dir.from, absolutePath) : ".",
    search: parsedUrl.search || "",
    hash: parsedUrl.hash || ""
  }
}
