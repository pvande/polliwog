module.exports.router = (req, res) => {
  switch (req.path) {
    case '/redirect/301':
      res.statusCode = 301
      res.setHeader('Location', '/hello')
      res.end()
      throw 'Routed.'

    case '/redirect/chain':
      res.statusCode = 301
      res.setHeader('Location', '/redirect/301')
      res.end()
      throw 'Routed.'
  }
}

module.exports.resetState = () => {}
