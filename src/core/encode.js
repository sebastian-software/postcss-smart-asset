import { promises as fs } from "fs"

/**
 * Optimize encoding SVG files (IE9+, Android 3+)
 *
 * @see https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
 */
const optimizedSvgEncode = (svgContent) => {
  const result = encodeURIComponent(svgContent)
    .replace(/%3D/g, "=")
    .replace(/%3A/g, ":")
    .replace(/%2F/g, "/")
    .replace(/%22/g, "'")
    .replace(/%2C/g, ",")
    .replace(/%3B/g, ";")

  // Lowercase the hex-escapes for better gzipping
  return result.replace(/(%[\dA-Z]{2})/g, (matched, AZ) => AZ.toLowerCase())
}

/**
 * Encoding file contents to string
 */
export default async (file, encodeType, shouldOptimizeSvgEncode) => {
  const dataMime = `data:${file.mimeType}`

  const contents = await fs.readFile(file.path)

  if (encodeType === "base64") {
    return `${dataMime};base64,${contents.toString("base64")}`
  }

  const encodeFunc = encodeType === "encodeURI" ? encodeURI : encodeURIComponent

  const content = contents
    .toString("utf8")

    // removing new lines
    .replace(/\n+/g, "")

  let encodedStr =
    shouldOptimizeSvgEncode && encodeType === "encodeURIComponent"
      ? optimizedSvgEncode(content)
      : encodeFunc(content)

  encodedStr = encodedStr.replace(/%20/g, " ").replace(/#/g, "%23")

  return `${dataMime},${encodedStr}`
}
