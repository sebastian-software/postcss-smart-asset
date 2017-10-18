import path from "path"
import {
  isUrlShouldBeIgnored,
  getAssetsPath,
  getTargetDir,
  getDirDeclFile,
  getPathByBasePath,
  prepareAsset,
  normalize
} from "./paths"

describe("paths", () => {
  test("should ignore some urls", () => {
    const isUrlShouldBeIgnoredWrapper = (url) => isUrlShouldBeIgnored(url, {})

    expect(
      [
        "#hash",
        "%23encodedHash",
        "/absoluteUrl",
        "data:someDataInlined",
        "https://somecdnpath.com/asset.png"
      ].every(isUrlShouldBeIgnoredWrapper)
    ).toBeTruthy()
  })

  test("should't ignore absolute urls if have basePath", () => {
    expect(
      isUrlShouldBeIgnored("/absoluteUrl", {
        basePath: [ "/path" ]
      })
    ).toBeFalsy()
  })

  describe("assets paths", () => {
    const baseDir = path.resolve("/user/project")

    test("should calc assets path", () => {
      expect(getAssetsPath(baseDir, "images", "imported")).toBe(path.resolve("/user/project/images/imported"))
    })

    test("should calc assets path with absolute assetsPath param", () => {
      expect(getAssetsPath(baseDir, "/user/assets/", "imported")).toBe(path.resolve("/user/assets/imported"))
    })

    test("should calc assets path without assetsPath param", () => {
      expect(getAssetsPath(baseDir, null, "imported")).toBe(path.resolve("/user/project/imported"))
    })
  })

  test("should return assets output base dir", () => {
    const dir = {
      from: "/user/project/css",
      to: "/user/project/build"
    }

    expect(getTargetDir(dir)).toBe(dir.to)
    expect(getTargetDir({ from: "/project", to: "/project" })).toBe(process.cwd())
  })

  test("should return decl file dir", () => {
    const decl = {
      source: { input: { file: "/project/styles/style.css" } }
    }

    expect(getDirDeclFile(decl)).toBe("/project/styles")
    expect(getDirDeclFile({})).toBe(process.cwd())
  })

  describe("calc path by basePath", () => {
    const basePath = path.resolve("/project/node_modules")
    const dirFrom = path.resolve("/project/styles")

    test("absolute basePath", () => {
      expect(getPathByBasePath(basePath, dirFrom, "./img/image.png")).toEqual([
        path.resolve("/project/node_modules/img/image.png")
      ])
    })

    test("relative basePath", () => {
      expect(getPathByBasePath("../base-path", dirFrom, "./img/image.png")).toEqual([
        path.resolve("/project/base-path/img/image.png")
      ])
    })

    test("absolute assetUrl", () => {
      expect(getPathByBasePath(basePath, dirFrom, "/img/image.png")).toEqual([
        path.resolve("/project/node_modules/img/image.png")
      ])
    })

    test("multiple basePath", () => {
      expect(getPathByBasePath([ basePath, "/some_base_path" ], dirFrom, "/img/image.png")).toEqual([
        path.resolve("/project/node_modules/img/image.png"),
        path.resolve("/some_base_path/img/image.png")
      ])
    })
  })

  test("should prepare asset data from url and dirs", () => {
    const assetUrl = "./sprite/some-image.png?test=1#23"
    const dirs = {
      from: "/project/css",
      file: "/project/css/imported"
    }

    const asset = prepareAsset(assetUrl, dirs)

    // normalizing path for windows
    asset.relativePath = normalize(asset.relativePath)

    expect(asset).toEqual({
      url: "./sprite/some-image.png?test=1#23",
      originUrl: "./sprite/some-image.png?test=1#23",
      pathname: "./sprite/some-image.png",
      absolutePath: path.resolve("/project/css/imported/sprite/some-image.png"),
      relativePath: "./imported/sprite/some-image.png",
      search: "?test=1",
      hash: "#23"
    })
  })

  test("should prepare custom assets", () => {
    const dirs = {
      from: "/project/css",
      file: "/project/css/imported"
    }
    const decl = {
      source: { input: { file: "/project/styles/style.css" } }
    }

    const checkCustomAsset = (assetUrl) => {
      const asset = prepareAsset(assetUrl, dirs, decl)

      expect(asset.absolutePath).toEqual("/project/styles/style.css")
      expect(normalize(asset.relativePath)).toEqual("../styles/style.css")
    }

    ;[ "#hash", "%23ecodedhash", "data:" ].forEach(checkCustomAsset)
  })
})
