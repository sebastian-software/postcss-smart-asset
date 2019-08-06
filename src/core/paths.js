import path from "path"
import url from "url"

/**
 * Normalizing result url, before replace decl value
 *
 * @param {string} assetUrl
 * @returns {string}
 */
export const normalize = (assetUrl) => {
  assetUrl = path.normalize(assetUrl)

  if (path.sep === "\\") {
    assetUrl = assetUrl.replace(/\\/g, "/")
  }

  if (assetUrl.charAt(0) !== "." && assetUrl.charAt(0) !== "/") {
    assetUrl = `./${  assetUrl}`
  }

  return assetUrl
}

/**
 * @param {string} assetUrl
 * @returns {boolean}
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
 * @param {string} assetUrl
 * @param {PostcssUrl~Options} options
 * @returns {boolean}
 */
export const isUrlShouldBeIgnored = (assetUrl, options) => {
  return isUrlWithoutPathname(assetUrl) || (assetUrl[0] === "/" && !options.basePath)
}

/**
 * @param {string} baseDir - absolute target path
 * @param {string} assetsPath - extend asset path, can be absolute path
 * @param {string} relative - current relative asset path
 * @returns {string}
 */
export const getAssetsPath = (baseDir, assetsPath, relative) =>
  path.resolve(baseDir, assetsPath || "", relative || "")

/**
 * Target path, output base dir
 *
 * @param {Dir} dir
 * @returns {string}
 */
export const getTargetDir = (dir) => (dir.from !== dir.to ? dir.to : process.cwd())

/**
 * Stylesheet file path from decl
 *
 * @param {Decl} decl
 * @returns {string}
 */
export const getPathDeclFile = (decl) =>
  decl.source && decl.source.input && decl.source.input.file

/**
 * Stylesheet file dir from decl
 *
 * @param {Decl} decl
 * @returns {string}
 */
export const getDirDeclFile = (decl) => {
  const filename = getPathDeclFile(decl)

  return filename ? path.dirname(filename) : process.cwd()
}

/**
 * Returns paths list, where we can find assets file
 *
 * @param {Array<string>|string} basePath - base paths where trying search to assets file
 * @param {Dir} dirFrom
 * @param {string} relPath - relative asset path
 * @returns {Array<string>}
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
 * @param {string} assetUrl
 * @param {PostcssUrl~Dir} dir
 * @param {Decl} decl
 * @returns {PostcssUrl~Asset}
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
