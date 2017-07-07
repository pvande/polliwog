const { parse } = require('url')
const cache = require('./cache')
const counter = require('./counter')
const error = require('./error')
const hello = require('./hello')
const redirect = require('./redirect')

module.exports.router = (req, res) => {
  req.path = parse(req.url).pathname

  res.statusCode = 200 // unless otherwise stated

  try {
    cache.router(req, res)
    counter.router(req, res)
    error.router(req, res)
    hello.router(req, res)
    redirect.router(req, res)
  } catch (e) {
    if (!res.finished) {
      throw e
    }
  }
}

module.exports.resetState = () => {
  cache.resetState()
  counter.resetState()
  error.resetState()
  hello.resetState()
  redirect.resetState()
}
