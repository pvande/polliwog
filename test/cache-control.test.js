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
  test('no-cache support', done => {
    const assertions = errorCatcher(done, data => {
      expect(data).toEqual({
        response: ['1', '2', '3', '4', '5', '6'],
        success: ['1', '2', '3', '4', '5', '6'],
        failure: [],
        error: [],
      })
    })

    pollerFor(url('/cache/no-cache'), {}, 6, assertions)
  })

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
})
