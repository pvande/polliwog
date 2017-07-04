const Pollster = require('../src/index')
const TestServer = require('./server')

const server = new TestServer()
const url = path => `http://${server.hostname}:${server.port}${path}`

const errorCatcher = (done, fn) => (...args) => {
  try {
    fn(...args)
    done()
  } catch (e) {
    done.fail(e)
  }
}

beforeEach(done => {
  server.start(done)
})

afterEach(done => {
  server.stop(done)
})

const pollerFor = (path, options, duration, done) => {
  const data = { response: [], success: [], failure: [], error: [] }
  const p = new Pollster(url(path), options)
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

describe('polling behavior', () => {
  test('performs periodic requests', done => {
    const assertions = errorCatcher(done, ({ success }) =>
      expect(success).toEqual(['1', '2', '3', '4']),
    )

    pollerFor('/counter', {}, 2100, assertions)
  })

  test('allows for custom intervals', done => {
    const assertions = errorCatcher(done, ({ success }) =>
      expect(success).toEqual(['1', '2', '3', '4', '5']),
    )

    pollerFor('/counter', { interval: 400 }, 2100, assertions)
  })
})
