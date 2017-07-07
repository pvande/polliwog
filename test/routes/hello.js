module.exports.router = (req, res) => {
  switch (req.path) {
    case '/hello':
      res.end('Hi!')
      throw 'DONE'
  }
}

module.exports.resetState = () => {}
