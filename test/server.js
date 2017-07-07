const http = require('http')
const { parse } = require('url')
const date = require('../src/date')

const initialState = {
  counter: 0,
  etag: Math.random(),
  modifiedAt: new Date(new Date().toUTCString()),
}
let state = initialState

const router = (req, res) => {
  res.statusCode = 200 // unless otherwise stated

  switch (parse(req.url).pathname) {
    case '/hello':
      res.end('Hi!')
      break

    case '/counter':
      state = Object.assign({}, state, { counter: state.counter + 1 })
      res.end(`${state.counter}`)
      break

    case '/counter/json':
      state = Object.assign({}, state, { counter: state.counter + 1 })
      res.end(`{"number":${state.counter}}`)
      break

    case '/cache/max-age':
      state = Object.assign({}, state, { counter: state.counter + 1 })
      res.setHeader('Cache-Control', 'private,max-age=2')
      res.end(`${state.counter}`)
      break

    case '/cache/expires':
      state = Object.assign({}, state, { counter: state.counter + 1 })
      res.setHeader('Cache-Control', 'private')
      res.setHeader('Expires', date.relativeAge(2).toUTCString())
      res.end(`${state.counter}`)
      break

    case '/cache/skewed-expires':
      state = Object.assign({}, state, { counter: state.counter + 1 })
      res.setHeader('Cache-Control', 'private')
      res.setHeader('Date', date.relativeAge(-32).toUTCString())
      res.setHeader('Expires', date.relativeAge(-2).toUTCString())
      res.end(`${state.counter}`)
      break

    case '/cache/invalid-expires':
      state = Object.assign({}, state, { counter: state.counter + 1 })
      res.setHeader('Cache-Control', 'private')
      res.setHeader('Expires', 'Yes.')
      res.end(`${state.counter}`)
      break

    case '/cache/max-age-and-expires':
      state = Object.assign({}, state, { counter: state.counter + 1 })
      res.setHeader('Cache-Control', 'private,max-age=1')
      res.setHeader('Expires', date.relativeAge(30).toUTCString())
      res.end(`${state.counter}`)
      break

    case '/cache/no-cache':
      state = Object.assign({}, state, { counter: state.counter + 1 })
      res.setHeader('Cache-Control', 'no-cache')
      res.end(`${state.counter}`)
      break

    case '/cache/last-modified':
      res.setHeader('Cache-Control', 'private')
      res.setHeader('Last-Modified', state.modifiedAt.toUTCString())

      if (new Date(req.headers['if-modified-since']) >= state.modifiedAt) {
        res.statusCode = 304
        res.end()

        const modifiedAt = new Date(new Date().toUTCString())
        state = Object.assign({}, state, { modifiedAt })
      } else {
        state = Object.assign({}, state, { counter: state.counter + 1 })
        res.end(`${state.counter}`)
      }
      break

    case '/cache/etag':
      res.setHeader('Cache-Control', 'private')
      res.setHeader('Etag', `${state.etag}`)

      if (req.headers['if-none-match'] === `${state.etag}`) {
        res.statusCode = 304
        res.end()

        state = Object.assign({}, state, { etag: Math.random() })
      } else {
        state = Object.assign({}, state, { counter: state.counter + 1 })
        res.end(`${state.counter}`)
      }
      break

    case '/redirect/301':
      res.statusCode = 301
      res.setHeader('Location', '/hello')
      res.end()
      break

    case '/redirect/chain':
      res.statusCode = 301
      res.setHeader('Location', '/redirect/301')
      res.end()
      break

    case '/error/400':
      res.statusCode = 400
      res.setHeader('Content-Type', 'text/plain')
      res.end('client error')
      break

    case '/error/500':
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain')
      res.end('server error')
      break

    default:
      res.statusCode = 400
      res.end('Not found.')
  }
}

class TestServer {
  constructor() {
    this.server = http.createServer(router)
    this.hostname = 'localhost'

    this.server.keepAliveTimeout = 1000
    this.server.on('error', function(err) {
      console.log(err.stack)
    })

    this.server.on('connection', function(socket) {
      socket.setTimeout(1500)
    })
  }

  start(cb) {
    state = initialState
    this.server.listen(0, this.hostname, () => {
      this.port = this.server.address().port
      cb()
    })
  }

  stop(cb) {
    this.server.close(cb)
  }
}

module.exports = TestServer

if (require.main === module) {
  const server = new TestServer()
  server.start(() => {
    console.log(
      `Server started listening at http://${server.hostname}:${server.port}`,
    )
  })
}
