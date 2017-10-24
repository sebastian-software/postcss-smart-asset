/* eslint-disable */
import matchOptions from "./match-options"
import { getPathDeclFile, getDirDeclFile, prepareAsset } from "./paths"

import copyType from "../type/copy"
import customType from "../type/custom"
import inlineType from "../type/inline"
import rebaseType from "../type/rebase"

const typeMap = {
  copy: copyType,
  custom: customType,
  inline: inlineType,
  rebase: rebaseType
}

/**
 * Restricted modes
 *
 * @type {String[]}
 */
const PROCESS_TYPES = ["rebase", "inline", "copy", "custom"]

const getUrlProcessorType = optionUrl => (typeof optionUrl === "function" ? "custom" : optionUrl || "rebase")

/**
 * @param {String} optionUrl
 * @returns {PostcssUrl~UrlProcessor}
 */
function getUrlProcessor(optionUrl) {
  const mode = getUrlProcessorType(optionUrl)

  if (PROCESS_TYPES.indexOf(mode) === -1) {
    throw new Error(`Unknown mode for postcss-url: ${mode}`)
  }

  return typeMap[mode]
}

/**
 * @param {PostcssUrl~UrlProcessor} urlProcessor
 * @param {Result} result
 * @param {Decl} decl
 * @returns {Function}
 */
const wrapUrlProcessor = (urlProcessor, result, decl) => {
  const warn = message => decl.warn(result, message)
  const addDependency = file =>
    result.messages.push({
      type: "dependency",
      file,
      parent: getPathDeclFile(decl)
    })

  return (asset, dir, option) => urlProcessor(asset, dir, option, decl, warn, result, addDependency)
}

/**
 * @param {String} url
 * @param {Dir} dir
 * @param {Options} options
 * @param {Result} result
 * @param {Decl} decl
 * @returns {String|undefined}
 */
export const replaceUrl = (url, dir, options, result, decl) => {
  const asset = prepareAsset(url, dir, decl)

  const matchedOptions = matchOptions(asset, options)

  if (!matchedOptions) return

  const process = option => {
    const wrappedUrlProcessor = wrapUrlProcessor(getUrlProcessor(option.url), result, decl)

    return wrappedUrlProcessor(asset, dir, option)
  }

  if (Array.isArray(matchedOptions)) {
    matchedOptions.forEach(option => (asset.url = process(option)))
  } else {
    asset.url = process(matchedOptions)
  }

  return asset.url
}

const WITH_QUOTES = /^['"]/

function buildResult(newUrl, matched, before, after) {
  if (!newUrl) return matched

  if (WITH_QUOTES.test(newUrl) && WITH_QUOTES.test(after)) {
    before = before.slice(0, -1)
    after = after.slice(1)
  }

  return `${before}${newUrl}${after}`
}

/**
 * @param {String} from
 * @param {String} to
 * @param {PostcssUrl~Options} options
 * @param {Result} result
 * @param {Decl} decl
 * @returns {PostcssUrl~DeclProcessor}
 */
export const declProcessor = (from, to, options, result, decl) => {
  const dir = { from, to, file: getDirDeclFile(decl) }
  const pattern = /(url\(\s*['"]?)([^"')]+)(["']?\s*\))/g

  if (!pattern) {
    return
  }

  const matches = decl.value.match(pattern)
  if (!matches) {
    return
  }

  return Promise.all(
    matches.map((singleMatch, index) => {
      const [matched, before, url, after] = /(url\(\s*['"]?)([^"')]+)(["']?\s*\))/.exec(singleMatch)

      const replacement = replaceUrl(url, dir, options, result, decl)

      if (replacement) {
        if (replacement.then) {
          return replacement.then(resolved => {
            //const fullReplacement = resolved == null ? null : `${before}${resolved}${after}`
            //return fullReplacement
            return buildResult(resolved, singleMatch, before, after)
          })
        } else {
          // const fullReplacement = `${before}${replacement}${after}`
          return buildResult(replacement, singleMatch, before, after)
        }
      } else {
        return null
      }
    })
  ).then(values => {
    decl.value = decl.value.replace(pattern, match => {
      const replacement = values.shift()
      return replacement == null ? match : replacement
    })
  })

  /*
  console.log("MATCHES:",matches)
  if (matches) {

    const promises = []

    matches.forEach((singleMatch) => {
      const [ matched, before, url, after ] = singleMatch.exec(pattern)

      console.log("BEFORE/URL/AFTER:", before, url, after)

      const newUrl = replaceUrl(url, dir, options, result, decl)
      if (newUrl) {
        if (newUrl.then) {

        } else {
          decl.value.replace(singleMatch, `${before}${newUrl}${after}`)


        }

      }



    })


*/

  /*
  if (matches) {
    const [ matched, before, url, after ] = matches

    const newUrl = replaceUrl(url, dir, options, result, decl)
    console.log("URL:",url,"=>",newUrl)

    if (newUrl) {

      if (newUrl.then) {

        return newUrl.then((resolved) => {
          decl.value.replace(matched, `${before}${resolved}${after}`)
        })

      } else {
        decl.value = decl.value.replace(matched, `${before}${newUrl}${after}`)
      }
    }

    return Promise.all(promises)
  }
  */

  /*
  decl.value = decl.value.replace(pattern, (matched, before, url, after) => {
    const newUrl = replaceUrl(url, dir, options, result, decl)
    if (newUrl && newUrl.then) {
      // If it's a promise

      return newUrl.then((result) => {
        return `${before}${result}${after}`
      })
    }

    return newUrl ? `${before}${newUrl}${after}` : matched
  })
  */
}

/**
 * @typedef {Object} PostcssUrl~Options - postcss-url Options
 * @property {String} [url=^rebase|inline|copy|custom] - processing mode
 * @property {Minimatch|RegExp|Function} [filter] - filter assets by relative pathname
 * @property {String} [assetsPath] - absolute or relative path to copy assets
 * @property {String|String[]} [basePath] - absolute or relative paths to search, when copy or inline
 * @property {Number} [maxSize] - max file size in kbytes for inline mode
 * @property {String} [fallback] - fallback mode if file exceeds maxSize
 * @property {Boolean} [useHash] - use file hash instead filename
 * @property {Boolean} [prependName] - if useHash is true, appends the hash to the filename instead of replacing it
 * @property {HashOptions} [hashOptions] - params for generating hash name
 */
