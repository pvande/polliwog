let counter = 0

module.exports.router = (req, res) => {
  switch (req.path) {
    case '/counter':
      counter++
      res.end(`${counter}`)
      throw 'Routed.'

    case '/counter/json':
      counter++
      res.end(`{"number":${counter}}`)
      throw 'Routed.'
  }
}

module.exports.resetState = () => (counter = 0)
