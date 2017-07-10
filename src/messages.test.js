import path from "path"
import postcss from "postcss"
import postcssUrl from "."
import { read } from "../test/setup"

describe("misc", () => {
  test("should add dependency messages with copy", () => {
    return postcss()
      .use(
        postcssUrl({
          url: "copy",
          assetsPath: "test/fixtures/build/assets"
        })
      )
      .process(read("copy"), {
        from: "test/fixtures/copy.css"
      })
      .then((result) => {
        const dependencies = result.messages.filter((m) => m.type === "dependency")
        expect(dependencies).toMatchSnapshot()
      })
  })

  test("should add dependency messages with inline", () => {
    return postcss()
      .use(
        postcssUrl({
          url: "inline",
          assetsPath: "test/fixtures/build/assets"
        })
      )
      .process(read("copy"), {
        from: "test/fixtures/copy.css"
      })
      .then((result) => {
        const dependencies = result.messages.filter((m) => m.type === "dependency")
        expect(dependencies).toMatchSnapshot()
      })
  })
})
