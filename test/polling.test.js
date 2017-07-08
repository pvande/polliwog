const TestServer = require('./server')
const { pollerFor, errorCatcher } = require('./helpers')

const server = new TestServer()
const url = path => `http://${server.hostname}:${server.port}${path}`

beforeEach(done => {
  server.start(done)
})

afterEach(done => {
  server.stop(done)
})

describe('polling behavior', () => {
  test('performs periodic requests', done => {
    const assertions = errorCatcher(done, data => {
      expect(data).toEqual({
        response: [[200, '1'], [200, '2'], [200, '3']],
        success: ['1', '2', '3'],
        failure: [],
        error: [],
      })
    })

    pollerFor(url('/counter'), {}, 3, assertions)
  })

  test('follows redirects', done => {
    const assertions = errorCatcher(done, data => {
      expect(data).toEqual({
        response: [[200, 'Hi!']],
        success: ['Hi!'],
        failure: [],
        error: [],
      })
    })

    pollerFor(url('/redirect/chain'), {}, 1, assertions)
  })

  describe('broadcasts unsuccessful requests', () => {
    test('4xx errors', done => {
      const assertions = errorCatcher(done, data => {
        expect(data).toEqual({
          response: [[400, 'client error']],
          success: [],
          failure: ['client error'],
          error: [],
        })
      })

      pollerFor(url('/error/400'), {}, 1, assertions)
    })

    test('5xx errors', done => {
      const assertions = errorCatcher(done, data => {
        expect(data).toEqual({
          response: [[500, 'server error']],
          success: [],
          failure: ['server error'],
          error: [],
        })
      })

      pollerFor(url('/error/500'), {}, 1, assertions)
    })

    test('intermittent failures', done => {
      const assertions = errorCatcher(done, data => {
        expect(data).toEqual({
          response: [
            [200, '1'],
            [500, 'server error'],
            [200, '1'],
            [500, 'server error'],
            [200, '1'],
          ],
          success: ['1'],
          failure: ['server error'],
          error: [],
        })
      })

      pollerFor(url('/error/intermittent'), {}, 5, assertions)
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

      pollerFor(url(':300000'), {}, 1, assertions)
    })
  })
})
