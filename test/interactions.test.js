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

describe('interactions', () => {
  test('parsing a non-json source as json', done => {
    const assertions = errorCatcher(done, data => {
      expect(data).toEqual({
        response: [],
        success: [],
        failure: [],
        error: [new SyntaxError('Unexpected token H in JSON at position 0')],
      })
    })

    pollerFor(url('/hello'), { json: true }, 1, assertions)
  })
})
