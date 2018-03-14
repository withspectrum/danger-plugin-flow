import flow from "./index"

declare const global: any

const files = {
  "src/typed.js":
    "// @flow\nconst a = 'b'",
  "src/typed-with-asteriks.js":
    "/* @flow */\nconst a = 'b'",
  "src/untyped.js":
    "const a = 'b'",
  "src/second-untyped.js": "const a = 'c'"
}

const fileNames = Object.keys(files)

global.danger = {
  git: {
    created_files: [fileNames[0], fileNames[2]],
    modified_files: [fileNames[1], fileNames[3]],
  },
  github: {
    utils: {
      fileContents: path =>
        new Promise(res => {
          res(files[path])
        }),
    },
  },
}

describe("flow()", () => {
  beforeEach(() => {
    global.warn = jest.fn()
    global.message = jest.fn()
    global.fail = jest.fn()
    global.markdown = jest.fn()
  })

  afterEach(() => {
    global.warn = undefined
    global.message = undefined
    global.fail = undefined
    global.markdown = undefined
  })

  it("calls fail if there\'s untyped new files", async () => {
    await flow()
    expect(global.fail).toHaveBeenCalled()
    expect(global.fail.mock.calls[0][0]).toMatchSnapshot()
  })

  it("calls warn if the warn option is true", async () => {
    await flow({ warn: true })
    expect(global.warn).toHaveBeenCalled()
  })

  it("does not include modified files if modified is set to false", async () => {
    await flow({ modified: false })
    expect(global.fail).toHaveBeenCalled()
    expect(global.fail.mock.calls[0][0]).toMatchSnapshot()
  })
})
