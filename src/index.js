const { fetch } = require('fetch-ponyfill')()
const EventEmitter = require('events')

const defaults = { interval: 500, json: false }
module.exports = class Pollster extends EventEmitter {
  constructor(url, options = {}) {
    super()
    this.running = false
    this.url = url
    this.interval = options.interval || defaults.interval
    this.parseJSON = options.json || defaults.json
  }

  start() {
    const onSuccess = res => {
      if (!this.running) {
        return
      }

      return res.text().then(result => {
        if (this.processJSON) {
          result = JSON.parse(result)
        }

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

      fetch(this.url)
        .then(onSuccess)
        .catch(onFailure)
        .then(() => this.emit('poll'))
    }

    this.running = setInterval(poll, this.interval)
  }

  stop() {
    clearInterval(this.running)
    this.running = false
  }
}
