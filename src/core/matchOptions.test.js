import path from "path"
import matchOptions from "./matchOptions"

describe("match options", () => {
  test("should match options from array", () => {
    const options = [
      { url: "copy", filter: "**/*.png" },
      { url: "inline", filter: "**/*.gif" },
      { url: "rebase", filter: "**/*.svg" }
    ]
    const asset = {
      url: "asset.gif",
      absolutePath: path.resolve(process.cwd(), "some/path/to/asset.gif")
    }

    expect(matchOptions(asset, options).url).toEqual("inline")
  })

  test("should find first matched option by path", () => {
    const options = [
      { url: "copy", filter: "/some/another/path/**/*.png" },
      { url: "inline", filter: "some/path/**/*.gif" },
      { url: "inline2", filter: "some/path/**/*.gif" },
      { url: "rebase", filter: "/asset/path/**/*.svg" }
    ]
    const asset = {
      url: "asset.gif",
      absolutePath: path.resolve(process.cwd(), "some/path/to/asset.gif")
    }
    const option = matchOptions(asset, options)

    expect(option && option.url).toEqual("inline")
  })

  test("should match options with custom filter", () => {
    const options = [
      { url: "copy", filter: (asset) => asset.absolutePath.indexOf("asset") !== -1 },
      { url: "inline", filter: "**/*.gif" },
      { url: "rebase", filter: "**/*.svg" }
    ]
    const asset = {
      url: "asset.gif",
      absolutePath: path.resolve(process.cwd(), "some/path/to/asset.gif")
    }

    expect(matchOptions(asset, options).url).toEqual("copy")
  })

  test("should match multiple options", () => {
    const options = [
      { url: "copy", filter: (asset) => asset.absolutePath.indexOf("asset") !== -1 },
      { url: "inline", filter: "**/*.gif" },
      { url: "rebase", filter: "**/*.svg" },
      { url: () => "custom", filter: "**/*.gif", multi: true }
    ]
    const asset = {
      url: "asset.gif",
      absolutePath: path.resolve(process.cwd(), "some/path/to/asset.gif")
    }

    const matched = matchOptions(asset, options)

    expect(matched[1].url()).toBe("custom")
    expect(matched).toHaveLength(2)
  })

  test("should match single option", () => {
    const options = [
      { url: "copy", filter: (asset) => asset.absolutePath.indexOf("asset") !== -1 },
      { url: "inline", filter: "**/*.gif" },
      { url: "rebase", filter: "**/*.svg" },
      { url: () => "custom", filter: "**/*.svg", multi: true }
    ]
    const asset = {
      url: "asset.gif",
      absolutePath: path.resolve(process.cwd(), "some/path/to/asset.gif")
    }

    expect(Array.isArray(matchOptions(asset, options))).toBeFalsy()
  })
})
