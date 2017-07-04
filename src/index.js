const { fetch } = require('fetch-ponyfill')()
const EventEmitter = require('events')

const defaults = { interval: 500 }
module.exports = class Pollster extends EventEmitter {
  constructor(url, options = {}) {
    super()
    this.running = false
    this.url = url
    this.options = Object.assign({}, defaults, options)
  }

  start() {
    const onSuccess = res => {
      if (!this.running) {
        return
      }

      res.text().then(result => {
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

      fetch(this.url).then(onSuccess, onFailure)
    }

    this.running = setInterval(poll, this.options.interval)
  }

  stop() {
    clearInterval(this.running)
    this.running = false
  }
}
