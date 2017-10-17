import path from "path"
import url from "url"

/**
 * Normalizing result url, before replace decl value
 *
 * @param {String} assetUrl
 * @returns {String}
 */
export const normalize = (assetUrl) => {
  assetUrl = path.normalize(assetUrl)

  if (path.sep === "\\") {
    assetUrl = assetUrl.replace(/\\/g, "/")
  }

  if (assetUrl.charAt(0) !== "." && assetUrl.charAt(0) !== "/") {
    assetUrl = "./" + assetUrl
  }

  return assetUrl
}

/**
 * @param {String} assetUrl
 * @returns {Boolean}
 */
export const isUrlWithoutPathname = (assetUrl) => {
  return (
    assetUrl[0] === "#" ||
    assetUrl.indexOf("%23") === 0 ||
    assetUrl.indexOf("data:") === 0 ||
    (/^[a-z]+:\/\//).test(assetUrl)
  )
}

/**
 * Check if url is absolute, hash or data-uri
 *
 * @param {String} assetUrl
 * @param {PostcssUrl~Options} options
 * @returns {Boolean}
 */
export const isUrlShouldBeIgnored = (assetUrl, options) => {
  return isUrlWithoutPathname(assetUrl) || (assetUrl[0] === "/" && !options.basePath)
}

/**
 * @param {String} baseDir - absolute target path
 * @param {String} assetsPath - extend asset path, can be absolute path
 * @param {String} relative - current relative asset path
 * @returns {String}
 */
export const getAssetsPath = (baseDir, assetsPath, relative) =>
  path.resolve(baseDir, assetsPath || "", relative || "")

/**
 * Target path, output base dir
 *
 * @param {Dir} dir
 * @returns {String}
 */
export const getTargetDir = (dir) => (dir.from !== dir.to ? dir.to : process.cwd())

/**
 * Stylesheet file path from decl
 *
 * @param {Decl} decl
 * @returns {String}
 */
export const getPathDeclFile = (decl) => decl.source && decl.source.input && decl.source.input.file

/**
 * Stylesheet file dir from decl
 *
 * @param {Decl} decl
 * @returns {String}
 */
export const getDirDeclFile = (decl) => {
  const filename = getPathDeclFile(decl)

  return filename ? path.dirname(filename) : process.cwd()
}

/**
 * Returns paths list, where we can find assets file
 *
 * @param {String[]|String} basePath - base paths where trying search to assets file
 * @param {Dir} dirFrom
 * @param {String} relPath - relative asset path
 * @returns {String[]}
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
 *
 * @param {String} assetUrl
 * @param {PostcssUrl~Dir} dir
 * @param {Decl} decl
 * @returns {PostcssUrl~Asset}
 */
export const prepareAsset = (assetUrl, dir, decl) => {
  const parsedUrl = url.parse(assetUrl)
  const pathname = !isUrlWithoutPathname(assetUrl) ? parsedUrl.pathname : null
  const absolutePath = pathname ? path.resolve(path.join(dir.file, pathname)) : getPathDeclFile(decl)

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

/**
 * @typedef {Object} PostcssUrl~Asset
 * @property {String} url - origin asset url
 * @property {String} name - parsed asset filename
 * @property {String} absolutePath - absolute asset path
 * @property {String} relativePath - relative asset path (relative to target dir)
 * @property {String} search - search from url, ex. ?query=1
 * @property {String} hash - hash from url
 */

/**
 * @typedef {Object} PostcssUrl~Dir
 * @property {String} from - dirname from postcss option 'from'
 * @property {String} to - dirname from postcss option 'to'
 * @property {String} file - decl file dirname (css file)
 */
