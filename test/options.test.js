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

describe('polling options', () => {
  test('custom intervals', done => {
    const startedAt = new Date()
    const assertions = errorCatcher(done, data => {
      const finishedAt = new Date()
      const duration = finishedAt.getTime() - startedAt.getTime()

      expect(duration).toBeGreaterThan(400 /* ms */)
      expect(duration).toBeLessThan(450 /* ms */)
      expect(data).toEqual({
        response: ['1', '2', '3', '4'],
        success: ['1', '2', '3', '4'],
        failure: [],
        error: [],
      })
    })

    pollerFor(url('/counter'), { interval: 100 }, 4, assertions)
  })

  describe('json', () => {
    test('valid', done => {
      const assertions = errorCatcher(done, data => {
        expect(data).toEqual({
          response: [{ number: 1 }, { number: 2 }, { number: 3 }],
          success: [{ number: 1 }, { number: 2 }, { number: 3 }],
          failure: [],
          error: [],
        })
      })

      pollerFor(url('/counter/json'), { json: true }, 3, assertions)
    })

    test('invalid', done => {
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

  test('emit unchanged data', done => {
    const assertions = errorCatcher(done, data => {
      expect(data).toEqual({
        response: ['Hi!', 'Hi!', 'Hi!'],
        success: ['Hi!', 'Hi!', 'Hi!'],
        failure: [],
        error: [],
      })
    })

    pollerFor(url('/hello'), { emitUnchanged: true }, 3, assertions)
  })
})
