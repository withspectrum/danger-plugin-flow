import flow from "./index"

declare const global: any

jest.mock("fs")

const files = {
  "src/typed.js": "// @flow\nconst a = 'b'",
  "src/typed-with-asteriks.js": "/* @flow */\nconst a = 'b'",
  "src/untyped.js": "const a = 'b'",
  "src/second-untyped.js": "const a = 'c'",
  "src/noflow.js": "// @noflow\nconst a = 'b'",
}

const fileNames = Object.keys(files)

describe("flow()", () => {
  beforeEach(() => {
    global.warn = jest.fn()
    global.message = jest.fn()
    global.fail = jest.fn()
    global.markdown = jest.fn()
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
  })

  afterEach(() => {
    global.warn = undefined
    global.message = undefined
    global.fail = undefined
    global.markdown = undefined
    global.danger = undefined
  })

  it("detect @noflow", async () => {
    global.danger.git.modified_files = [fileNames[4]]
    global.danger.git.created_files = [fileNames[4]]
    await flow()
    expect(global.fail).not.toHaveBeenCalled()
  })

  it("calls fail if there's untyped new files", async () => {
    global.danger.git.modified_files = []
    await flow()
    expect(global.fail).toHaveBeenCalled()
    expect(global.fail).toHaveBeenCalledTimes(1)
    expect(global.fail.mock.calls[0][0]).toMatchSnapshot()
  })

  it("calls fail if there's untyped modified files", async () => {
    global.danger.git.created_files = []
    await flow()
    expect(global.fail).toHaveBeenCalled()
    expect(global.fail).toHaveBeenCalledTimes(1)
    expect(global.fail.mock.calls[0][0]).toMatchSnapshot()
  })

  it("calls fail twice if there's untyped files", async () => {
    await flow()
    expect(global.fail).toHaveBeenCalled()
    expect(global.fail).toHaveBeenCalledTimes(2)
    expect(global.fail.mock.calls[0][0]).toMatchSnapshot()
    expect(global.fail.mock.calls[1][0]).toMatchSnapshot()
  })

  it("calls warn if there's untyped new files", async () => {
    global.danger.git.modified_files = []
    await flow({ created: "warn" })
    expect(global.warn).toHaveBeenCalled()
    expect(global.fail).not.toHaveBeenCalled()
    expect(global.warn).toHaveBeenCalledTimes(1)
    expect(global.warn.mock.calls[0][0]).toMatchSnapshot()
  })

  it("calls warn if there's untyped modified files", async () => {
    global.danger.git.created_files = []
    await flow({ modified: "warn" })
    expect(global.warn).toHaveBeenCalled()
    expect(global.fail).not.toHaveBeenCalled()
    expect(global.warn).toHaveBeenCalledTimes(1)
    expect(global.warn.mock.calls[0][0]).toMatchSnapshot()
  })

  it("does not include modified files if modified is set to false", async () => {
    await flow({ modified: false })
    expect(global.fail).toHaveBeenCalled()
    expect(global.fail).toHaveBeenCalledTimes(1)
    expect(global.fail.mock.calls[0][0]).toMatchSnapshot()
  })

  it("does not include created files if modified is set to false", async () => {
    await flow({ created: false })
    expect(global.fail).toHaveBeenCalled()
    expect(global.fail).toHaveBeenCalledTimes(1)
    expect(global.fail.mock.calls[0][0]).toMatchSnapshot()
  })

  it("respects the blacklist globs", async () => {
    await flow({ blacklist: ["src/untyped*"] })
    expect(global.fail).toHaveBeenCalled()
    expect(global.fail.mock.calls[0][0]).toMatchSnapshot()
  })

  it("does not call fail if there's no untyped new files", async () => {
    const typedFiles = {
      "src/typed.js": "// @flow\nconst a = 'b'",
      "src/typed-with-asteriks.js": "/* @flow */\nconst a = 'b'",
    }
    global.danger = {
      git: {
        modified_files: ["src/typed.js"],
        created_files: ["src/typed-with-asteriks.js"],
      },
      github: {
        utils: {
          fileContents: path =>
            new Promise(res => {
              res(typedFiles[path])
            }),
        },
      },
    }
    await flow()
    expect(global.fail).not.toHaveBeenCalled()
  })
})

describe("flow() local", () => {
  beforeEach(() => {
    global.warn = jest.fn()
    global.message = jest.fn()
    global.fail = jest.fn()
    global.markdown = jest.fn()
    global.danger = {
      git: {
        created_files: [fileNames[0], fileNames[2]],
        modified_files: [fileNames[1], fileNames[3]],
      },
    }

    require("fs").__setMockFiles(files)
  })

  afterEach(() => {
    global.warn = undefined
    global.message = undefined
    global.fail = undefined
    global.markdown = undefined
    global.danger = undefined
  })

  it("detect @noflow", async () => {
    global.danger.git.modified_files = [fileNames[4]]
    global.danger.git.created_files = [fileNames[4]]
    await flow({ platform: "local" })
    expect(global.fail).not.toHaveBeenCalled()
  })

  it("calls fail if there's untyped new files", async () => {
    global.danger.git.modified_files = []
    await flow({ platform: "local" })
    expect(global.fail).toHaveBeenCalled()
    expect(global.fail).toHaveBeenCalledTimes(1)
    expect(global.fail.mock.calls[0][0]).toMatchSnapshot()
  })

  it("calls fail if there's untyped modified files", async () => {
    global.danger.git.created_files = []
    await flow({ platform: "local" })
    expect(global.fail).toHaveBeenCalled()
    expect(global.fail).toHaveBeenCalledTimes(1)
    expect(global.fail.mock.calls[0][0]).toMatchSnapshot()
  })

  it("calls fail twice if there's untyped files", async () => {
    await flow({ platform: "local" })
    expect(global.fail).toHaveBeenCalled()
    expect(global.fail).toHaveBeenCalledTimes(2)
    expect(global.fail.mock.calls[0][0]).toMatchSnapshot()
    expect(global.fail.mock.calls[1][0]).toMatchSnapshot()
  })

  it("calls warn if there's untyped new files", async () => {
    global.danger.git.modified_files = []
    await flow({ created: "warn", platform: "local" })
    expect(global.warn).toHaveBeenCalled()
    expect(global.fail).not.toHaveBeenCalled()
    expect(global.warn).toHaveBeenCalledTimes(1)
    expect(global.warn.mock.calls[0][0]).toMatchSnapshot()
  })

  it("calls warn if there's untyped modified files", async () => {
    global.danger.git.created_files = []
    await flow({ modified: "warn", platform: "local" })
    expect(global.warn).toHaveBeenCalled()
    expect(global.fail).not.toHaveBeenCalled()
    expect(global.warn).toHaveBeenCalledTimes(1)
    expect(global.warn.mock.calls[0][0]).toMatchSnapshot()
  })

  it("does not include modified files if modified is set to false", async () => {
    await flow({ modified: false, platform: "local" })
    expect(global.fail).toHaveBeenCalled()
    expect(global.fail).toHaveBeenCalledTimes(1)
    expect(global.fail.mock.calls[0][0]).toMatchSnapshot()
  })

  it("does not include created files if modified is set to false", async () => {
    await flow({ created: false, platform: "local" })
    expect(global.fail).toHaveBeenCalled()
    expect(global.fail).toHaveBeenCalledTimes(1)
    expect(global.fail.mock.calls[0][0]).toMatchSnapshot()
  })

  it("respects the blacklist globs", async () => {
    await flow({ blacklist: ["src/untyped*"], platform: "local" })
    expect(global.fail).toHaveBeenCalled()
    expect(global.fail.mock.calls[0][0]).toMatchSnapshot()
  })

  it("does not call fail if there's no untyped new files", async () => {
    const typedFiles = {
      "src/typed.js": "// @flow\nconst a = 'b'",
      "src/typed-with-asteriks.js": "/* @flow */\nconst a = 'b'",
    }
    global.danger = {
      git: {
        modified_files: ["src/typed.js"],
        created_files: ["src/typed-with-asteriks.js"],
      },
      github: {
        utils: {
          fileContents: path =>
            new Promise(res => {
              res(typedFiles[path])
            }),
        },
      },
    }
    await flow({ platform: "local" })
    expect(global.fail).not.toHaveBeenCalled()
  })
})
