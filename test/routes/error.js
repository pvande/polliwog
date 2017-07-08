let counter = 0

module.exports.router = (req, res) => {
  switch (req.path) {
    case '/error/400':
      res.statusCode = 400
      res.setHeader('Content-Type', 'text/plain')
      res.end('client error')
      throw 'DONE'

    case '/error/500':
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain')
      res.end('server error')
      throw 'DONE'

    case '/error/intermittent':
      counter++
      res.setHeader('Content-Type', 'text/plain')
      if (counter % 2) {
        res.end('1')
      } else {
        res.statusCode = 500
        res.end('server error')
      }
      throw 'DONE'
  }
}

module.exports.resetState = () => (counter = 0)
