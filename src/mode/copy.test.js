import { compareFixtures, processedCss } from "../../test/setup"

describe("copy without assetsPath", () => {
  const opts = {
    url: "copy"
  }

  compareFixtures("cant-copy", "shouldn't copy assets if not info available", opts)

  const postcssOpts = {
    from: "test/fixtures/index.css",
    to: "test/fixtures/build/index.css"
  }

  testCopy(opts, postcssOpts)
})

describe("copy with assetsPath", () => {
  const opts = {
    url: "copy",
    assetsPath: "assets"
  }

  compareFixtures("cant-copy", "shouldn't copy assets if not info available", opts)

  const postcssOpts = {
    from: "test/fixtures/index.css",
    to: "test/fixtures/build/index.css"
  }

  testCopy(opts, postcssOpts)
})

describe('copy with assetsPath and without "to"', () => {
  const opts = {
    url: "copy",
    assetsPath: "test/fixtures/build/assets"
  }

  const postcssOpts = {
    from: "test/fixtures/index.css"
  }

  testCopy(opts, postcssOpts)
})

describe("copy when inline fallback", () => {
  const opts = {
    url: "inline",
    maxSize: 0.0001,
    fallback: "copy",
    assetsPath: "assets"
  }

  compareFixtures("cant-copy", "shouldn't copy assets if not info available", opts)

  const postcssOpts = {
    from: "test/fixtures/index.css",
    to: "test/fixtures/build/index.css"
  }

  testCopy(opts, postcssOpts)
})

function testCopy(opts, postcssOpts) {
  const optsWithHash = Object.assign({}, opts, { useHash: true })
  const optsWithHashAppend = Object.assign({}, opts, {
    useHash: true,
    keepName: true
  })

  describe(
    // eslint-disable-next-line
    "should copy asset from the source (`from`) to the " +
      "assets destination (`to` + `assetsPath`)",
    () => {
      test("rebase the url", () =>
        processedCss("copy", opts, postcssOpts).then((css) => {
          expect(css).toMatchSnapshot()
        }))

      test("rebase the url keeping parameters", () =>
        processedCss("copy-parameters", opts, postcssOpts).then((css) => {
          expect(css).toMatchSnapshot()
        }))

      test("rebase the url using a hash name", () =>
        processedCss("copy-hash", optsWithHash, postcssOpts).then((css) => {
          expect(css).toMatchSnapshot()
        }))

      test("rebase the url using a hash name keeping parameters", () =>
        processedCss("copy-hash-parameters", optsWithHash, postcssOpts).then((css) => {
          expect(css).toMatchSnapshot()
        }))

      test("rebase the url appending a hash to the name", () =>
        processedCss("copy-hash", optsWithHashAppend, postcssOpts).then((css) => {
          expect(css).toMatchSnapshot()
        }))

      test("rebase the url using appending a hash to the name name keeping parameters", () =>
        processedCss("copy-hash-parameters", optsWithHashAppend, postcssOpts).then(
          (css) => {
            expect(css).toMatchSnapshot()
          }
        ))
    }
  )
}
