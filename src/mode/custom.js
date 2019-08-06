/**
 * Transform url() based on a custom callback
 */
export function customAsset(asset, dir, options) {
  return options.url.apply(null, arguments)
}
