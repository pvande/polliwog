module.exports.router = (req, res) => {
  switch (req.path) {
    case '/hello':
      res.end('Hi!')
      throw 'Routed.'
  }
}

module.exports.resetState = () => {}
