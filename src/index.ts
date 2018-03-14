declare var require: (string) => any
// tslint:disable-next-line
const mm = require("micromatch")
// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import {DangerDSLType} from "../node_modules/danger/distribution/dsl/DangerDSL"
declare var danger: DangerDSLType
export declare function message(message: string): void
export declare function warn(message: string): void
export declare function fail(message: string): void
export declare function markdown(message: string): void

const ENDS_WITH_JS = /jsx?$/i

export interface Options {
  blacklist?: string[];
  warn?: boolean;
  modified?: boolean;
}

/**
 * Make sure people flowtype their code
 */
export default async function flow(options: Options = {}) {
  const blacklist = options && options.blacklist ? options.blacklist : []
  const includeModifiedFiles = options.modified === false ? false : true
  const method = options.warn ? warn : fail
  const jsFiles = danger.git.created_files.concat(includeModifiedFiles ? danger.git.modified_files : [])
    .filter(path => ENDS_WITH_JS.test(path))
  const unignoredFiles: string[] = mm.not(jsFiles, blacklist)
  const files = await Promise.all(
    unignoredFiles.map(path =>
      danger.github.utils.fileContents(path).then(content => ({
        path,
        content,
      })),
    ),
  )

  const unflowedFiles = files.filter(({ content }) => !/@flow/.test(content)).map(({ path }) => path)

  method(`These new files do not have Flow enabled:\n - ${unflowedFiles.join("\n - ")}`)
}
