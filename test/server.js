const http = require('http')
const { router, resetState } = require('./routes')

class TestServer {
  constructor() {
    this.server = http.createServer(router)
    this.hostname = 'localhost'

    this.server.keepAliveTimeout = 1000
    this.server.on('error', err => console.log(err.stack))

    this.server.on('connection', function(socket) {
      socket.setTimeout(1500)
    })
  }

  start(cb) {
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
