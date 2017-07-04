const Pollster = require('../src/index')

module.exports.pollerFor = (url, options, duration, done) => {
  const data = { response: [], success: [], failure: [], error: [] }
  const p = new Pollster(url, options)
  p.on('response', x => data.response.push(x))
  p.on('success', x => data.success.push(x))
  p.on('failure', x => data.failure.push(x))
  p.on('error', x => data.error.push(x))

  p.start()
  setTimeout(() => {
    p.stop()
    done(data)
  }, duration)
}

module.exports.errorCatcher = (done, fn) => (...args) => {
  try {
    fn(...args)
    done()
  } catch (e) {
    done.fail(e)
  }
}
