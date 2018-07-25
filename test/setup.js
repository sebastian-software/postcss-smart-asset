import fs from "fs"
import postcss from "postcss"
import url from "../src"

export function readAsync(name) {
  return new Promise((resolve, reject) => {
    fs.readFile(`test/fixtures/${name}.css`, "utf8", (error, data) => {
      if (error) {
        reject(error)
      } else {
        resolve(data.trim())
      }
    })
  })
}

export function compareFixtures(
  name,
  message,
  urlOpts = {},
  postcssOpts = {},
  plugin = null
) {
  if (postcssOpts.from == null) {
    postcssOpts.from = undefined
  }

  test(message, () => {
    const pcss = postcss()

    if (plugin) {
      pcss.use(plugin())
    }

    pcss.use(url(urlOpts))
    return readAsync(name)
      .then((value) => pcss.process(value, postcssOpts))
      .then((result) => {
        expect(result.css).toMatchSnapshot()
      })
  })
}

export function processedCss(name, urlOpts = {}, postcssOpts = {}) {
  const pcss = postcss().use(url(urlOpts))
  return readAsync(name)
    .then((value) => pcss.process(value, postcssOpts))
    .then((result) => result.css)
}
