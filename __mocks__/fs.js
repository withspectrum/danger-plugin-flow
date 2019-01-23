
let mockFiles = {}

function __setMockFiles(newMockFiles) {
  mockFiles = newMockFiles
}

function readFile(path, encoding, callback) {
  if (mockFiles[path]) {
    callback(null, mockFiles[path])
    return
  }

  callback(new Error('File contents not configured in test.'))
}

module.exports = {
  __setMockFiles,
  readFile,
}
