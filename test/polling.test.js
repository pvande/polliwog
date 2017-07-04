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
    const assertions = errorCatcher(done, data => {
      expect(data).toEqual({
        response: ['1', '2', '3'],
        success: ['1', '2', '3'],
        failure: [],
        error: [],
      })
    })

    pollerFor('/counter', {}, 1600, assertions)
  })

  test('follows redirects', done => {
    const assertions = errorCatcher(done, data => {
      expect(data).toEqual({
        response: ['Hi!'],
        success: ['Hi!'],
        failure: [],
        error: [],
      })
    })

    pollerFor('/redirect/chain', {}, 600, assertions)
  })

  describe('broadcasts unsuccessful requests', () => {
    test('4xx errors', done => {
      const assertions = errorCatcher(done, data => {
        expect(data).toEqual({
          response: ['client error'],
          success: [],
          failure: ['client error'],
          error: [],
        })
      })

      pollerFor('/error/400', {}, 600, assertions)
    })

    test('5xx errors', done => {
      const assertions = errorCatcher(done, data => {
        expect(data).toEqual({
          response: ['server error'],
          success: [],
          failure: ['server error'],
          error: [],
        })
      })

      pollerFor('/error/500', {}, 600, assertions)
    })

    test('network errors', done => {
      const assertions = errorCatcher(done, data => {
        expect(data).toEqual({
          response: [],
          success: [],
          failure: [],
          error: [
            new RangeError('"port" option should be >= 0 and < 65536: 300000'),
          ],
        })
      })

      pollerFor(':300000', {}, 600, assertions)
    })
  })

  describe('options', () => {
    test('custom intervals', done => {
      const assertions = errorCatcher(done, data => {
        expect(data).toEqual({
          response: ['1', '2', '3', '4'],
          success: ['1', '2', '3', '4'],
          failure: [],
          error: [],
        })
      })

      pollerFor('/counter', { interval: 200 }, 900, assertions)
    })

    describe('parsing as', () => {
      test('json', done => {
        const assertions = errorCatcher(done, data => {
          expect(data).toEqual({
            response: [{ number: 1 }, { number: 2 }, { number: 3 }],
            success: [{ number: 1 }, { number: 2 }, { number: 3 }],
            failure: [],
            error: [],
          })
        })

        pollerFor('/counter/json', { as: 'json' }, 1600, assertions)
      })

      test('arrayBuffer')
      test('blob')
      test('buffer') // Node only
      test('textConverted') // Node only
    })
  })
})
