import { copyAsset, customAsset, inlineAsset, rebaseAsset } from "../mode"
import matchOptions from "./matchOptions"
import { getDirDeclFile, getPathDeclFile, prepareAsset } from "./paths"

const modeMap = {
  copy: copyAsset,
  custom: customAsset,
  inline: inlineAsset,
  rebase: rebaseAsset
}

/**
 * Restricted modes
 */
const PROCESS_TYPES = new Set([ "rebase", "inline", "copy", "custom" ])

const getUrlProcessorType = (optionUrl) =>
  typeof optionUrl === "function" ? "custom" : optionUrl || "rebase"

function getUrlProcessor(optionUrl) {
  const mode = getUrlProcessorType(optionUrl)

  if (!PROCESS_TYPES.has(mode)) {
    throw new Error(`Unknown mode for postcss-url: ${mode}`)
  }

  return modeMap[mode]
}

const wrapUrlProcessor = (urlProcessor, result, decl) => {
  const warn = (message) => decl.warn(result, message)
  const addDependency = (file) =>
    result.messages.push({
      type: "dependency",
      file,
      parent: getPathDeclFile(decl)
    })

  return (asset, dir, option) =>
    urlProcessor(asset, dir, option, decl, warn, result, addDependency)
}

const replaceUrl = (url, dir, options, result, decl) => {
  const asset = prepareAsset(url, dir, decl)

  const matchedOptions = matchOptions(asset, options)

  if (!matchedOptions) {
    return
  }

  const process = (option) => {
    const wrappedUrlProcessor = wrapUrlProcessor(
      getUrlProcessor(option.url),
      result,
      decl
    )

    return wrappedUrlProcessor(asset, dir, option)
  }

  if (Array.isArray(matchedOptions)) {
    matchedOptions.forEach((option) => {
      asset.url = process(option)
    })
  } else {
    asset.url = process(matchedOptions)
  }

  return asset.url
}

const WITH_QUOTES = /^["']/

function buildResult(newUrl, matched, before, after) {
  if (!newUrl) {
    return matched
  }

  if (WITH_QUOTES.test(newUrl) && WITH_QUOTES.test(after)) {
    before = before.slice(0, -1)
    after = after.slice(1)
  }

  return `${before}${newUrl}${after}`
}

export const declProcessor = (from, to, options, result, decl) => {
  const dir = { from, to, file: getDirDeclFile(decl) }
  const pattern = /(url\(\s*["']?)([^"')]+)(["']?\s*\))/g

  if (!pattern) {
    return
  }

  const matches = decl.value.match(pattern)
  if (!matches) {
    return
  }

  return Promise.all(
    matches.map((singleMatch, index) => {
      const [ matched, before, url, after ] = (/(url\(\s*["']?)([^"')]+)(["']?\s*\))/).exec(
        singleMatch
      )

      const replacement = replaceUrl(url, dir, options, result, decl)

      if (replacement) {
        if (replacement.then) {
          return replacement.then((resolved) =>
            // const fullReplacement = resolved == null ? null : `${before}${resolved}${after}`
            // return fullReplacement
            buildResult(resolved, singleMatch, before, after)
          )
        }
        // const fullReplacement = `${before}${replacement}${after}`
        return buildResult(replacement, singleMatch, before, after)
      }
      return null
    })
  ).then((values) => {
    decl.value = decl.value.replace(pattern, (match) => {
      const replacement = values.shift()
      return replacement == null ? match : replacement
    })
  })
}
