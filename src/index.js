const EventEmitter = require('events')
const Fetcher = require('./fetcher')
const Poller = require('./poller')

const defaults = {
  interval: 500,
  json: false,
  emitUnchanged: false,
  skipCache: false,
  skipEtag: false,
  skipLastModified: false,
}
module.exports = class Pollster extends EventEmitter {
  constructor(url, opts = {}) {
    super()
    this.running = false
    this.url = url
    this.interval = opts.interval || defaults.interval
    this.json = opts.json || defaults.json
    this.emitUnchanged = opts.emitUnchanged || defaults.emitUnchanged
    this.skipCache = opts.skipCache || defaults.skipCache
    this.skipEtag = opts.skipEtag || defaults.skipEtag
    this.skipLastModified = opts.skipLastModified || defaults.skipLastModified
  }

  start() {
    const fetchData = Fetcher(this.url, {
      skipCache: this.skipCache,
      skipEtag: this.skipEtag,
      skipLastModified: this.skipLastModified,
    })

    const poll = Poller(fetchData, this.emit.bind(this), {
      json: this.json,
      emitUnchanged: this.emitUnchanged,
    })

    this.running = setInterval(poll, this.interval)
    poll()
  }

  stop() {
    clearInterval(this.running)
    this.running = false
  }
}
