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

describe('polling options', () => {
  test('custom intervals', () => {
    const startedAt = new Date()
    return poll(url('/counter'), { interval: 100 }).times(4).run(data => {
      const finishedAt = new Date()
      const duration = finishedAt.getTime() - startedAt.getTime()

      expect(duration).toBeGreaterThan(400 /* ms */)
      expect(duration).toBeLessThan(450 /* ms */)
      expect(data).toEqual({
        response: [[200, '1'], [200, '2'], [200, '3'], [200, '4']],
        success: ['1', '2', '3', '4'],
        failure: [],
        error: [],
      })
    })
  })

  describe('json', () => {
    test('valid', () =>
      poll(url('/counter/json'), { json: true }).times(3).run(data => {
        expect(data).toEqual({
          response: [
            [200, { number: 1 }],
            [200, { number: 2 }],
            [200, { number: 3 }],
          ],
          success: [{ number: 1 }, { number: 2 }, { number: 3 }],
          failure: [],
          error: [],
        })
      }))

    test('invalid', () =>
      poll(url('/hello'), { json: true }).times(1).run(data => {
        expect(data).toEqual({
          response: [],
          success: [],
          failure: [],
          error: [new SyntaxError('Unexpected token H in JSON at position 0')],
        })
      }))
  })

  test('emit unchanged data', () =>
    poll(url('/hello'), { emitUnchanged: true }).times(3).run(data => {
      expect(data).toEqual({
        response: [[200, 'Hi!'], [200, 'Hi!'], [200, 'Hi!']],
        success: ['Hi!', 'Hi!', 'Hi!'],
        failure: [],
        error: [],
      })
    }))

  test('ignoring etags', () =>
    poll(url('/cache/etag'), { skipEtag: true }).times(5).run(data => {
      expect(data).toEqual({
        response: [[200, '1'], [200, '2'], [200, '3'], [200, '4'], [200, '5']],
        success: ['1', '2', '3', '4', '5'],
        failure: [],
        error: [],
      })
    }))

  test('ignoring last modified', () =>
    poll(url('/cache/last-modified'), { skipLastModified: true })
      .times(5)
      .run(data => {
        expect(data).toEqual({
          response: [
            [200, '1'],
            [200, '2'],
            [200, '3'],
            [200, '4'],
            [200, '5'],
          ],
          success: ['1', '2', '3', '4', '5'],
          failure: [],
          error: [],
        })
      }))
})
