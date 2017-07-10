const TestServer = require('./server')
const { poll } = require('./helpers')

const server = new TestServer()
const url = path => `http://${server.hostname}:${server.port}${path}`

beforeEach(done => {
  server.start(done)
})

afterEach(done => {
  server.stop(done)
})

describe('caching', () => {
  test('etag support', () =>
    poll(url('/cache/etag')).times(6).run(data => {
      expect(server.requests.total).toEqual(6)
      expect(server.requests[200]).toEqual(3)
      expect(server.requests[304]).toEqual(3)

      expect(data).toEqual({
        response: [[200, '1'], [200, '2'], [200, '3']],
        success: ['1', '2', '3'],
        failure: [],
        error: [],
      })
    }))
})
