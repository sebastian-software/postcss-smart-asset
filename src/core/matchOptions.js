import path from "path"

import minimatch from "minimatch"

import { isUrlShouldBeIgnored } from "./paths"

/**
 * Returns whether the given asset matches the given pattern
Allways returns true if the given pattern is empty
 *
 * @param asset the processed asset
 * @param pattern A minimatch string,
 * regular expression or function to test the asset
 */
const matchesFilter = (asset, pattern) => {
  const relativeToRoot = path.relative(process.cwd(), asset.absolutePath)

  if (typeof pattern === "string") {
    pattern = minimatch.filter(pattern)

    return pattern(relativeToRoot)
  }

  if (pattern instanceof RegExp) {
    return pattern.test(relativeToRoot)
  }

  if (pattern instanceof Function) {
    return pattern(asset)
  }

  return true
}

/**
 * Matching single option
 */
const matchOption = (asset, option) => {
  const matched = matchesFilter(asset, option.filter)

  if (!matched) {
    return false
  }

  return typeof option.url === "function" || !isUrlShouldBeIgnored(asset.url, option)
}

const isMultiOption = (option) => option.multi && typeof option.url === "function"

/**
 * Matching options by asset
 */
const matchOptions = (asset, options) => {
  if (!options) {
    return
  }

  if (Array.isArray(options)) {
    const optionIndex = options.findIndex((option) => matchOption(asset, option))

    if (optionIndex < 0) {
      return
    }

    const matchedOption = options[optionIndex]

    // if founded option is last
    if (optionIndex === options.length - 1) {
      return matchedOption
    }

    const extendOptions = options
      .slice(optionIndex + 1)
      .filter(
        (option) =>
          (isMultiOption(matchedOption) || isMultiOption(option)) &&
          matchOption(asset, option)
      )

    return extendOptions.length > 0 ? [ matchedOption ].concat(extendOptions) : matchedOption
  }

  if (matchOption(asset, options)) {
    return options
  }
}

export default matchOptions
