declare var require: (string) => any
import fs from "fs"
import mm from "micromatch"
// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import { DangerDSLType } from "../node_modules/danger/distribution/dsl/DangerDSL"
declare var danger: DangerDSLType
export declare function message(message: string): void
export declare function warn(message: string): void
export declare function fail(message: string): void
export declare function markdown(message: string): void

const ENDS_WITH_JS = /jsx?$/i

export type Method = "warn" | "fail" | "message" | false

export const PLATFORM_GITHUB = "github"
export const PLATFORM_LOCAL = "local"
export const PLATFORMS = {
  [PLATFORM_GITHUB]: PLATFORM_GITHUB,
  [PLATFORM_LOCAL]: PLATFORM_LOCAL,
}

export type Platform = keyof typeof PLATFORMS

export interface Options {
  blacklist?: string[]
  modified?: Method
  created?: Method
  platform?: Platform
}

function readFileLocal(path: string) {
  const FILE_ENCODING = "utf8"
  return new Promise((resolve, reject) => {
    fs.readFile(path, FILE_ENCODING, (err, data) => {
      if (err) {
        reject(err)
        return
      }

      resolve({ path, content: data })
    })
  })
}

function readFileGitHub(path: string) {
  return danger.github.utils.fileContents(path).then(content => ({
    path,
    content,
  }))
}

/**
 * Make sure people flowtype their code
 */
export default async function flow(options: Options = {}) {
  // The danger methods, keyed by their name
  const methods = {
    fail,
    warn,
    message,
  }

  const blacklist = options && options.blacklist ? options.blacklist : []
  const includeModifiedFiles = options.modified === false ? false : true
  const modifiedMethod = options.modified === undefined ? "fail" : options.modified
  const createdMethod = options.created === undefined ? "fail" : options.created
  const jsFiles = danger.git.created_files
    .concat(includeModifiedFiles ? danger.git.modified_files : [])
    .filter(path => ENDS_WITH_JS.test(path))
  const unignoredFiles: string[] = mm.not(jsFiles, blacklist)
  const files = await Promise.all(
    unignoredFiles.map(path => {
      if (options.platform && options.platform === PLATFORM_LOCAL) {
        return readFileLocal(path)
      } else {
        return readFileGitHub(path)
      }
    })
  )

  function detectFlowPragma(content): boolean {
    const flowPragma = "@flow"
    const noFlowPragma = "@noflow"
    const maxLines = 10
    const lines = content.toString("utf-8").split("\n", maxLines)

    return lines.filter(line => line.includes(flowPragma) || line.includes(noFlowPragma)).length === 0
  }

  const unflowedFiles = files.filter(({ content }) => detectFlowPragma(content)).map(({ path }) => path)

  if (unflowedFiles.length === 0) {
    return
  }

  const modifiedUnflowedFiles = unflowedFiles.filter(path => danger.git.modified_files.indexOf(path) > -1)
  const createdUnflowedFiles = unflowedFiles.filter(path => danger.git.created_files.indexOf(path) > -1)

  if (modifiedUnflowedFiles.length > 0 && modifiedMethod) {
    // tslint:disable-next-line max-line-length
    methods[modifiedMethod](
      `These **modified** files do not have Flow enabled:\n - ${modifiedUnflowedFiles.join("\n - ")}`
    )
  }

  if (createdUnflowedFiles.length > 0 && createdMethod) {
    // tslint:disable-next-line max-line-length
    methods[createdMethod](`These **new** files do not have Flow enabled:\n - ${createdUnflowedFiles.join("\n - ")}`)
  }
}
