const EventEmitter = require('events')
const Fetcher = require('./fetcher')
const Poller = require('./poller')

const defaults = { interval: 500, json: false }
module.exports = class Pollster extends EventEmitter {
  constructor(url, options = {}) {
    super()
    this.running = false
    this.url = url
    this.interval = options.interval || defaults.interval
    this.json = options.json || defaults.json
  }

  start() {
    const emit = this.emit.bind(this)
    const stopProcessing = () => !this.running
    const fetchData = Fetcher(this.url, stopProcessing)
    const poll = Poller(fetchData, emit, { json: this.json })

    this.running = setInterval(poll, this.interval)
  }

  stop() {
    clearInterval(this.running)
    this.running = false
  }
}
