import fs from "fs"
import path from "path"
import getFile from "./get-file"

describe("get-file", () => {
  const dir = { from: "test/fixtures" }
  const warn = (message) => assert.fail(null, null, message)

  test("should read file without basePath option", () => {
    const asset = {
      pathname: "../pixel.gif",
      absolutePath: "test/fixtures/pixel.gif"
    }
    const file = getFile(asset, {}, dir, warn)

    expect(file).toMatchSnapshot()
  })

  test("should show warn message when can't read file", () => {
    const asset = {
      pathname: "../pixel.gif",
      absolutePath: "test/fixtures/pixel-no-exists.gif"
    }
    let warnMessage = false

    getFile(asset, {}, dir, (message) => (warnMessage = message))

    expect(warnMessage).toBe("Can't read file 'test/fixtures/pixel-no-exists.gif', ignoring")
  })

  test("should read file with basePath option", () => {
    const options = { basePath: path.resolve("test/fixtures/imported") }
    const asset = {
      pathname: "../pixel.gif",
      absolutePath: "test/fixtures/pixel-not-exists.gif"
    }
    const file = getFile(asset, options, dir, warn)

    expect(file).toMatchSnapshot()
  })

  test("should read file with multiple basePath option", () => {
    const options = {
      basePath: [ "not-exists-folder", path.resolve("test/fixtures/imported") ]
    }
    const asset = {
      pathname: "../pixel.gif",
      absolutePath: "test/fixtures/pixel-not-exists.gif"
    }
    const file = getFile(asset, options, dir, warn)

    expect(file).toMatchSnapshot()
  })
})
