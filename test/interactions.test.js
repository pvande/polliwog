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

describe('interactions', () => {
  test('parsing a non-json source as json', done => {
    const assertions = errorCatcher(done, data => {
      expect(data).toEqual({
        response: [],
        success: [],
        failure: [],
        error: [
          new SyntaxError('Unexpected token H in JSON at position 0'),
          new SyntaxError('Unexpected token H in JSON at position 0'),
        ],
      })
    })

    pollerFor('/hello', { as: 'json' }, 1100, assertions)
  })
})
