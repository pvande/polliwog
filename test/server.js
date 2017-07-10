const http = require('http')
const { router, resetState } = require('./routes')

const initialState = { total: 0, 200: 0, 301: 0, 304: 0, 400: 0, 500: 0 }

class TestServer {
  constructor() {
    this.server = http.createServer((req, res) => {
      router(req, res)
      this.requests.total++
      this.requests[res.statusCode]++
    })
    this.hostname = 'localhost'

    this.server.keepAliveTimeout = 1000
    this.server.on('error', err => console.log(err.stack))

    this.server.on('connection', function(socket) {
      socket.setTimeout(1500)
    })
  }

  start(cb) {
    this.requests = Object.assign({}, initialState)
    resetState()
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
