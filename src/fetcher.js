const { fetch } = require('fetch-ponyfill')()
const date = require('./date')

const ABORT = { reason: 'ABORTED' }

module.exports = (url, isStopped) => {
  let cacheCode, cacheValue
  let lastModified, etag
  let cacheExpires = new Date()

  const conditionalHeaders = () => {
    const headers = {}

    if (lastModified) {
      headers['If-Modified-Since'] = lastModified
    }

    if (etag) {
      headers['If-None-Match'] = etag
    }

    return headers
  }

  const storeCachingDetails = headers => {
    const cacheControl = headers.get('Cache-Control') || ''
    if (cacheControl === 'no-cache') {
      return
    }

    const serverDate = headers.get('Date') || ''
    const expires = headers.get('Expires') || ''
    const [_, age] = cacheControl.match(/max-age=(\d+)/) || []

    if (age) {
      cacheExpires = date.secondsFromNow(parseInt(age))
    } else if (expires) {
      const freshnessDuration = date.calculateSkew(serverDate, expires)
      cacheExpires = date.secondsFromNow(freshnessDuration)
    }

    lastModified = headers.get('Last-Modified')
    etag = headers.get('Etag')
  }

  return async function() {
    if (isStopped()) {
      throw ABORT
    }

    if (cacheExpires > new Date()) {
      return [cacheCode, cacheValue]
    }

    const response = await fetch(url, { headers: conditionalHeaders() })
    if (isStopped()) {
      throw ABORT
    }

    if ((etag || lastModified) && response.status == 304) {
      return [cacheCode, cacheValue]
    }

    storeCachingDetails(response.headers)

    const body = await response.text()
    cacheCode = response.ok
    cacheValue = body

    return [cacheCode, cacheValue]
  }
}

module.exports.ABORT = ABORT
