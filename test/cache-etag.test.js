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
  test('etag support', done => {
    const assertions = errorCatcher(done, data => {
      expect(data).toEqual({
        response: [[200, '1'], [200, '2'], [200, '3']],
        success: ['1', '2', '3'],
        failure: [],
        error: [],
      })
    })

    pollerFor(url('/cache/etag'), {}, 6, assertions)
  })
})
