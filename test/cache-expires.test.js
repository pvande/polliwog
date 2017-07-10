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
  test('expires support', () =>
    poll(url('/cache/expires')).seconds(3.5).run(data => {
      expect(server.requests.total).toEqual(2)
      expect(data).toEqual({
        response: [[200, '1'], [200, '2']],
        success: ['1', '2'],
        failure: [],
        error: [],
      })
    }))

  // If the Expires header isn't a parseable date, the client is expected to
  // treat it as an immediate expiration.
  test('expires timestamp is unparsable', () =>
    poll(url('/cache/invalid-expires')).times(3).run(data => {
      expect(server.requests.total).toEqual(3)
      expect(data).toEqual({
        response: [[200, '1'], [200, '2'], [200, '3']],
        success: ['1', '2', '3'],
        failure: [],
        error: [],
      })
    }))

  // The Date and Expires headers will be generated based on the server's
  // internal time.  We can still calculate an "expected cache age" by taking
  // the difference of those two headers, though this can lead to scenarios
  // where an Expires date from the (local) past should still be considered
  // valid.
  //
  // @see RFC 2616, section 13.2.4
  test('date and expires timestamps are skewed', () =>
    poll(url('/cache/skewed-expires')).times(5).run(data => {
      expect(server.requests.total).toEqual(1)
      expect(data).toEqual({
        response: [[200, '1']],
        success: ['1'],
        failure: [],
        error: [],
      })
    }))

  // In the event that both an Expires header and a max-age directive have been
  // provided, the max-age directive takes precedence.
  //
  // @see RFC 2616, section 13.2.4
  test('endpoint specifies both max-age and expires headers', () =>
    poll(url('/cache/max-age-and-expires')).times(6).run(data => {
      expect(server.requests.total).toEqual(3)
      expect(data).toEqual({
        response: [[200, '1'], [200, '2'], [200, '3']],
        success: ['1', '2', '3'],
        failure: [],
        error: [],
      })
    }))
})
