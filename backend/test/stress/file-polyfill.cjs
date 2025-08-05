const { Blob } = require('buffer')

class FilePolyfill extends Blob {
  constructor (parts, name, options = {}) {
    super(parts, options)
    this.name = name
    this.lastModified = options.lastModified || Date.now()
  }
}

if (!global.File) {
  global.File = FilePolyfill
}
