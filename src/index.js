const EventEmitter = require('events')
const Fetcher = require('./fetcher')

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
    const emitter = this
    const fetchData = Fetcher(this.url, () => !this.running)

    let lastOk, lastResult, processedResult

    const poll = async function() {
      try {
        const [ok, result] = await fetchData()

        if (ok === lastOk && result === lastResult) {
          return
        } else {
          lastOk = ok
          lastResult = result
        }

        processedResult = emitter.parseJSON ? JSON.parse(result) : result

        emitter.emit('response', processedResult)
        emitter.emit(ok ? 'success' : 'failure', processedResult)
      } catch (err) {
        if (err !== Fetcher.ABORT) {
          emitter.emit('error', err)
        }
      } finally {
        emitter.emit('poll')
      }
    }

    this.running = setInterval(poll, this.interval)
  }

  stop() {
    clearInterval(this.running)
    this.running = false
  }
}
