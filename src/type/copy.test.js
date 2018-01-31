import { processedCss, compareFixtures } from "../../test/setup"

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
    prependName: true
  })
  const assetsPath = opts.assetsPath ? `${opts.assetsPath}\/` : ""
  const patterns = {
    copyPixelPng: new RegExp(`"./${assetsPath}imported\/pixel\.png"`),
    copyPixelGif: new RegExp(`"./${assetsPath}pixel\\.gif"`),
    copyParamsPixelPngHash: new RegExp(
      `"./${assetsPath}imported\/pixel\\.png\\?\#iefix"`
    ),
    copyParamsPixelPngParam: new RegExp(
      `"./${assetsPath}imported\/pixel\\.png\\?foo=bar"`
    ),
    copyParamsPixelGif: new RegExp(`"./${assetsPath}pixel\\.gif\\#el"`),
    copyHashPixel8: new RegExp(`"./${assetsPath}dDcMwK\\.png"`),
    copyHashParamsPixel8: new RegExp(`"./${assetsPath}dDcMwK\\.png\\?v=1\\.1\\#iefix"`),
    copyHashAppendPixel8: new RegExp(`"./${assetsPath}pixel_dDcMwK\\.png"`),
    copyHashAppendParamsPixel8: new RegExp(
      `"./${assetsPath}pixel_dDcMwK\\.png\\?v=1\\.1\\#iefix"`
    )
  }
  const matchAll = (css, patternsKeys) =>
    expect(patternsKeys.every((pat) => css.match(patterns[pat]))).toBeTruthy()

  describe("should copy asset from the source (`from`) to the assets destination (`to` + `assetsPath`)", () => {
    test("rebase the url", () => {
      return processedCss("copy", opts, postcssOpts).then((css) => {
        matchAll(css, [ "copyPixelPng", "copyPixelGif" ])
      })
    })

    test("rebase the url keeping parameters", () => {
      return processedCss("copy-parameters", opts, postcssOpts).then((css) => {
        matchAll(css, [
          "copyParamsPixelPngHash",
          "copyParamsPixelPngParam",
          "copyParamsPixelGif"
        ])
      })
    })

    test("rebase the url using a hash name", () => {
      return processedCss("copy-hash", optsWithHash, postcssOpts).then((css) => {
        matchAll(css, [ "copyHashPixel8" ])
      })
    })

    test("rebase the url using a hash name keeping parameters", () => {
      return processedCss("copy-hash-parameters", optsWithHash, postcssOpts).then(
        (css) => {
          matchAll(css, [ "copyHashParamsPixel8" ])
        }
      )
    })

    test("rebase the url appending a hash to the name", () => {
      return processedCss("copy-hash", optsWithHashAppend, postcssOpts).then((css) => {
        matchAll(css, [ "copyHashAppendPixel8" ])
      })
    })

    test("rebase the url using appending a hash to the name name keeping parameters", () => {
      return processedCss("copy-hash-parameters", optsWithHashAppend, postcssOpts).then(
        (css) => {
          matchAll(css, [ "copyHashAppendParamsPixel8" ])
        }
      )
    })
  })
}
