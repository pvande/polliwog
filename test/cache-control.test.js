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
  test('no-cache support', () =>
    poll(url('/cache/no-cache')).times(3).run(data => {
      expect(server.requests.total).toEqual(3)
      expect(data).toEqual({
        response: [[200, '1'], [200, '2'], [200, '3']],
        success: ['1', '2', '3'],
        failure: [],
        error: [],
      })
    }))

  test('max-age support', () =>
    poll(url('/cache/max-age')).seconds(2.5).run(data => {
      expect(data).toEqual({
        response: [[200, '1'], [200, '2']],
        success: ['1', '2'],
        failure: [],
        error: [],
      })
    }))
})
