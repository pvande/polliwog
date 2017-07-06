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

describe('caching', () => {
  test('max-age support', done => {
    const assertions = errorCatcher(done, data => {
      expect(data).toEqual({
        response: ['1', '2'],
        success: ['1', '2'],
        failure: [],
        error: [],
      })
    })

    pollerFor(url('/cache/max-age'), {}, 6, assertions)
  })

  test('expires support', done => {
    const assertions = errorCatcher(done, data => {
      expect(data).toEqual({
        response: ['1', '2'],
        success: ['1', '2'],
        failure: [],
        error: [],
      })
    })

    pollerFor(url('/cache/expires'), {}, 6, assertions)
  })

  test('etag support', done => {
    const assertions = errorCatcher(done, data => {
      expect(data).toEqual({
        response: ['1', '2', '3'],
        success: ['1', '2', '3'],
        failure: [],
        error: [],
      })
    })

    pollerFor(url('/cache/etag'), {}, 6, assertions)
  })

  test('last-modified support', done => {
    const assertions = errorCatcher(done, data => {
      expect(data).toEqual({
        response: ['1', '2', '3'],
        success: ['1', '2', '3'],
        failure: [],
        error: [],
      })
    })

    pollerFor(url('/cache/last-modified'), {}, 6, assertions)
  })
})
