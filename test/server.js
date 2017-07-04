const http = require('http')
const { parse } = require('url')

let counter = 0
const router = (req, res) => {
  switch (parse(req.url).pathname) {
    case '/counter':
      res.statusCode = 200
      res.end(`${(counter += 1)}`)
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
