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
  test('expires support', done => {
    const assertions = errorCatcher(done, data => {
      expect(data).toEqual({
        response: [[200, '1'], [200, '2']],
        success: ['1', '2'],
        failure: [],
        error: [],
      })
    })

    pollerFor(url('/cache/expires'), {}, 6, assertions)
  })

  test('expires timestamp is unparsable', done => {
    const assertions = errorCatcher(done, data => {
      expect(data).toEqual({
        response: [[200, '1'], [200, '2'], [200, '3']],
        success: ['1', '2', '3'],
        failure: [],
        error: [],
      })
    })

    pollerFor(url('/cache/invalid-expires'), {}, 3, assertions)
  })

  test('date and expires timestamps are skewed', done => {
    const assertions = errorCatcher(done, data => {
      expect(data).toEqual({
        response: [[200, '1']],
        success: ['1'],
        failure: [],
        error: [],
      })
    })

    pollerFor(url('/cache/skewed-expires'), {}, 5, assertions)
  })

  test('endpoint specifies both max-age and expires headers', done => {
    const assertions = errorCatcher(done, data => {
      expect(data).toEqual({
        response: [[200, '1'], [200, '2'], [200, '3']],
        success: ['1', '2', '3'],
        failure: [],
        error: [],
      })
    })

    pollerFor(url('/cache/max-age-and-expires'), {}, 6, assertions)
  })
})
