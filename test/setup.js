import postcss from "postcss"
import fs from "fs"
import url from "../src"

export function read(name) {
  return fs.readFileSync(`test/${name}.css`, "utf8").trim()
}

export function compareFixtures(name, message, opts = {}, postcssOpts = {}, plugin = null) {
  test(message, () => {
    const pcss = postcss()

    if (plugin) {
      pcss.use(plugin())
    }

    pcss.use(url(opts))
    return pcss.process(read(`fixtures/${name}`), postcssOpts).then((result) => {
      expect(result.css).toMatchSnapshot()
    })
  })
}

export function processedCss(fixtures, urlOpts, postcssOpts) {
  return postcss().use(url(urlOpts)).process(read(fixtures), postcssOpts).css
}
