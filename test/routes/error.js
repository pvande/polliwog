module.exports.router = (req, res) => {
  switch (req.path) {
    case '/error/400':
      res.statusCode = 400
      res.setHeader('Content-Type', 'text/plain')
      res.end('client error')
      throw 'Routed.'

    case '/error/500':
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain')
      res.end('server error')
      throw 'Routed.'
  }
}

module.exports.resetState = () => {}
