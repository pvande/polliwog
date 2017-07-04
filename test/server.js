const http = require('http')
const { parse } = require('url')

const initialState = { counter: 0 }
let state = initialState

const router = (req, res) => {
  switch (parse(req.url).pathname) {
    case '/hello':
      res.statusCode = 200
      res.end('Hi!')
      break

    case '/counter':
      state = Object.assign({}, state, { counter: state.counter + 1 })
      res.statusCode = 200
      res.end(`${state.counter}`)
      break

    case '/counter/json':
      state = Object.assign({}, state, { counter: state.counter + 1 })
      res.statusCode = 200
      res.end(`{"number":${state.counter}}`)
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
