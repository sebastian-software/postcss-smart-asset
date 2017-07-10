import { processedCss, compareFixtures } from "../../test/setup"

describe("custom", () => {
  const opts = {
    url(asset, dir, options, decl, warn, result) {
      expect(asset.url).toBeTruthy()
      expect(dir.from).toBeTruthy()
      expect(options).toBeTruthy()
      expect(decl.value).toBeTruthy()
      expect(result.opts).toBeTruthy()
      expect(typeof warn).toBe("function")

      return asset.url.toUpperCase()
    }
  }

  compareFixtures("custom", "should transform url through custom callback", opts)
  compareFixtures("custom", "should transform url through custom callback with array options", [
    { url: "rebase", filter: /\.svg$/ },
    opts
  ])

  compareFixtures("custom-multi", "should transform url through custom callback with multi option", [
    { url: "rebase", filter: /\.svg$/ },
    {
      url(asset) {
        return asset.url.slice(1)
      }
    },
    {
      url(asset) {
        return asset.url.toLowerCase()
      },
      multi: true
    }
  ])
})
