import { resolve } from "path"
import postcss from "postcss"
import postcssUrl from "."
import { readAsync } from "../test/setup"

describe("misc", () => {
  test("should add dependency messages with copy", () =>
    readAsync("copy")
      .then((value) =>
        postcss()
          .use(
            postcssUrl({
              url: "copy",
              assetsPath: "test/fixtures/build/assets"
            })
          )
          .process(value, {
            from: "test/fixtures/copy.css"
          })
      )
      .then((result) => {
        const dependencies = result.messages.filter((message) => message.type === "dependency")
        expect(dependencies).toEqual([
          {
            type: "dependency",
            file: resolve("test/fixtures/imported/pixel.png"),
            parent: resolve("test/fixtures/copy.css")
          },
          {
            type: "dependency",
            file: resolve("test/fixtures/pixel.gif"),
            parent: resolve("test/fixtures/copy.css")
          }
        ])
      }))

  test("should add dependency messages with inline", () =>
    readAsync("copy").then((value) =>
      postcss()
        .use(
          postcssUrl({
            url: "inline",
            assetsPath: "test/fixtures/build/assets"
          })
        )
        .process(value, {
          from: "test/fixtures/copy.css"
        })
        .then((result) => {
          const dependencies = result.messages.filter((message) => message.type === "dependency")
          expect(dependencies).toEqual([
            {
              type: "dependency",
              file: resolve("test/fixtures/imported/pixel.png"),
              parent: resolve("test/fixtures/copy.css")
            },
            {
              type: "dependency",
              file: resolve("test/fixtures/pixel.gif"),
              parent: resolve("test/fixtures/copy.css")
            }
          ])
        })
    ))
})
