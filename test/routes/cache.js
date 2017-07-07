const date = require('../../src/date')
const relativeUTC = seconds => date.relativeAge(seconds).toUTCString()

const initialState = {
  counter: 0,
  etag: Math.random(),
  modifiedAt: new Date(relativeUTC(0)),
}

let state = initialState
const update = (key, fn) => {
  state = Object.assign({}, state, { [key]: fn(state[key]) })
}

module.exports.router = (req, res) => {
  switch (req.path) {
    case '/cache/max-age':
      update('counter', x => x + 1)
      res.setHeader('Cache-Control', 'private,max-age=2')
      res.end(`${state.counter}`)
      throw 'Routed.'

    case '/cache/expires':
      update('counter', x => x + 1)
      res.setHeader('Cache-Control', 'private')
      res.setHeader('Expires', relativeUTC(2))
      res.end(`${state.counter}`)
      throw 'Routed.'

    case '/cache/skewed-expires':
      update('counter', x => x + 1)
      res.setHeader('Cache-Control', 'private')
      res.setHeader('Date', relativeUTC(-32))
      res.setHeader('Expires', relativeUTC(-2))
      res.end(`${state.counter}`)
      throw 'Routed.'

    case '/cache/invalid-expires':
      update('counter', x => x + 1)
      res.setHeader('Cache-Control', 'private')
      res.setHeader('Expires', 'Yes.')
      res.end(`${state.counter}`)
      throw 'Routed.'

    case '/cache/max-age-and-expires':
      update('counter', x => x + 1)
      res.setHeader('Cache-Control', 'private,max-age=1')
      res.setHeader('Expires', relativeUTC(30))
      res.end(`${state.counter}`)
      throw 'Routed.'

    // case '/cache/no-cache':
    //   update('counter', x => x + 1)
    //   res.setHeader('Cache-Control', 'no-cache')
    //   res.end(`${state.counter}`)
    //   throw "Routed."

    case '/cache/last-modified':
      res.setHeader('Cache-Control', 'private')
      res.setHeader('Last-Modified', state.modifiedAt.toUTCString())

      if (new Date(req.headers['if-modified-since']) >= state.modifiedAt) {
        res.statusCode = 304
        res.end()

        update('modifiedAt', () => new Date(relativeUTC(0)))
      } else {
        update('counter', x => x + 1)
        res.end(`${state.counter}`)
      }
      throw 'Routed.'

    case '/cache/etag':
      res.setHeader('Cache-Control', 'private')
      res.setHeader('Etag', `${state.etag}`)

      if (req.headers['if-none-match'] === `${state.etag}`) {
        res.statusCode = 304
        res.end()

        update('etag', Math.random)
      } else {
        update('counter', x => x + 1)
        res.end(`${state.counter}`)
      }
      throw 'Routed.'
  }
}

module.exports.resetState = () => (state = initialState)
