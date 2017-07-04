const { fetch } = require('fetch-ponyfill')()
const EventEmitter = require('events')

const defaults = { interval: 500, as: 'text' }
module.exports = class Pollster extends EventEmitter {
  constructor(url, options = {}) {
    super()
    this.running = false
    this.url = url
    this.interval = options.interval || defaults.interval
    this.processAs = options.as || defaults.as
  }

  start() {
    const onSuccess = res => {
      if (!this.running) {
        return
      }

      return res[this.processAs]().then(result => {
        this.emit('response', result)
        this.emit(res.ok ? 'success' : 'failure', result)
      })
    }

    const onFailure = err => {
      if (!this.running) {
        return
      }

      this.emit('error', err)
    }

    const poll = () => {
      if (!this.running) {
        return
      }

      fetch(this.url).then(onSuccess).catch(onFailure)
    }

    this.running = setInterval(poll, this.interval)
  }

  stop() {
    clearInterval(this.running)
    this.running = false
  }
}
