const { fetch } = require('fetch-ponyfill')()
const EventEmitter = require('events')

module.exports = class Pollster extends EventEmitter {
  constructor(url, options = {}) {
    super()
    this.running = false
    this.url = url
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

    async function onFailure(err) {
      if (!this.running) {
        return
      }

      this.emit('error', err)
    }

    this.running = setInterval(() => {
      this.running && fetch(this.url).then(onSuccess, onFailure)
    }, 500)
  }

  stop() {
    clearInterval(this.running)
    this.running = false
  }
}
