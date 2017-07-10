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

describe('polling behavior', () => {
  test('performs periodic requests', () =>
    poll(url('/counter')).times(3).run(data => {
      expect(data).toEqual({
        response: [[200, '1'], [200, '2'], [200, '3']],
        success: ['1', '2', '3'],
        failure: [],
        error: [],
      })
    }))

  test('follows redirects', () =>
    poll(url('/redirect/chain')).times(1).run(data =>
      expect(data).toEqual({
        response: [[200, 'Hi!']],
        success: ['Hi!'],
        failure: [],
        error: [],
      }),
    ))

  describe('broadcasts unsuccessful requests', () => {
    test('4xx errors', () =>
      poll(url('/error/400')).times(1).run(data =>
        expect(data).toEqual({
          response: [[400, 'client error']],
          success: [],
          failure: ['client error'],
          error: [],
        }),
      ))

    test('5xx errors', () =>
      poll(url('/error/500')).times(1).run(data =>
        expect(data).toEqual({
          response: [[500, 'server error']],
          success: [],
          failure: ['server error'],
          error: [],
        }),
      ))

    test('intermittent failures', () =>
      poll(url('/error/intermittent')).times(5).run(data =>
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
        }),
      ))

    test('network errors', () =>
      poll(url(':300000')).times(1).run(data =>
        expect(data).toEqual({
          response: [],
          success: [],
          failure: [],
          error: [
            new RangeError('"port" option should be >= 0 and < 65536: 300000'),
          ],
        }),
      ))
  })
})
