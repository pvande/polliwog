const Pollster = require('../src/index')

module.exports.poll = (...pollsterArgs) => {
  const data = { response: [], success: [], failure: [], error: [] }
  const p = new Pollster(...pollsterArgs)
  p.on('response', (code, _, body) => data.response.push([code, body]))
  p.on('success', x => data.success.push(x))
  p.on('failure', x => data.failure.push(x))
  p.on('error', x => data.error.push(x))

  let resolve
  const promise = new Promise(r => {
    resolve = r
  })

  const runner = {
    run: fn => {
      p.start()
      return promise.then(fn)
    },
  }

  return {
    times: n => {
      let count = 0
      p.on('poll', () => {
        count += 1
        if (count >= n) {
          p.stop()
          resolve(data)
        }
      })

      return runner
    },
    responses: n => {
      p.on('poll', () => {
        if (data.response.length >= n) {
          p.stop()
          resolve(data)
        }
      })

      return runner
    },
    seconds: n => {
      const stopper = () => {
        p.stop()
        resolve(data)
      }
      setTimeout(stopper, n * 1000)

      return runner
    },
  }
}
