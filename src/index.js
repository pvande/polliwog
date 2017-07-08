const EventEmitter = require('events')
const Fetcher = require('./fetcher')
const Poller = require('./poller')

const defaults = {
  interval: 500,
  json: false,
  emitUnchanged: false,
  ignoreEtag: false,
}
module.exports = class Pollster extends EventEmitter {
  constructor(url, options = {}) {
    super()
    this.running = false
    this.url = url
    this.interval = options.interval || defaults.interval
    this.json = options.json || defaults.json
    this.emitUnchanged = options.emitUnchanged || defaults.emitUnchanged
    this.ignoreEtag = options.ignoreEtag || defaults.ignoreEtag
  }

  start() {
    const emit = this.emit.bind(this)
    const fetchData = Fetcher(this.url, { ignoreEtag: this.ignoreEtag })
    const poll = Poller(fetchData, emit, {
      json: this.json,
      emitUnchanged: this.emitUnchanged,
    })

    this.running = setInterval(poll, this.interval)
  }

  stop() {
    clearInterval(this.running)
    this.running = false
  }
}
