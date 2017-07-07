const { fetch } = require('fetch-ponyfill')()
const date = require('./date')

module.exports = url => {
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

    const serverDate = headers.get('Date')
    const expires = headers.get('Expires') || ''
    const [_, age] = cacheControl.match(/max-age=(\d+)/) || []

    if (age) {
      cacheExpires = date.relativeAge(parseInt(age))
    } else if (expires) {
      cacheExpires = date.relativeExpires(serverDate, expires)
    }

    lastModified = headers.get('Last-Modified')
    etag = headers.get('Etag')
  }

  return async function() {
    if (cacheExpires > new Date()) {
      return [cacheCode, cacheValue]
    }

    const response = await fetch(url, { headers: conditionalHeaders() })

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
