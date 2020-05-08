import fs from "fs"

import mime from "mime/lite"

import { getPathByBasePath } from "./paths"

const getFile = (asset, options, dir, warn) => {
  const paths = options.basePath
    ? getPathByBasePath(options.basePath, dir.from, asset.pathname)
    : [ asset.absolutePath ]
  const filePath = paths.find(fs.existsSync)

  if (!filePath) {
    warn(`Can't read file '${paths.join()}', ignoring`)

    return
  }

  return {
    path: filePath,
    mimeType: mime.getType(filePath)
  }
}

export default getFile
