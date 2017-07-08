const Pollster = require('../src/index')

module.exports.pollerFor = (url, options, requests, done) => {
  const data = { response: [], success: [], failure: [], error: [] }
  const p = new Pollster(url, options)
  p.on('response', (code, _, body) => data.response.push([code, body]))
  p.on('success', x => data.success.push(x))
  p.on('failure', x => data.failure.push(x))
  p.on('error', x => data.error.push(x))

  let count = 0
  p.on('poll', () => {
    count += 1
    if (count >= requests) {
      p.stop()
      done(data)
    }
  })

  p.start()
}

module.exports.errorCatcher = (done, fn) => (...args) => {
  try {
    fn(...args)
    done()
  } catch (e) {
    done.fail(e)
  }
}
