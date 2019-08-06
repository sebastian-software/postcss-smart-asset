/**
 * Transform url() based on a custom callback
 */
export default function getCustomProcessor(asset, dir, options) {
  return options.url.apply(null, arguments)
}
