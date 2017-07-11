const fetch = require('node-fetch')
const date = require('./date')

module.exports = (url, options) => {
  let cache
  let lastModified, etag
  let cacheExpires = new Date()

  const conditionalHeaders = () => {
    const headers = {}

    if (lastModified && !options.skipLastModified) {
      headers['If-Modified-Since'] = lastModified
    }

    if (etag && !options.skipEtag) {
      headers['If-None-Match'] = etag
    }

    return headers
  }

  const storeCachingDetails = headers => {
    const cacheControl = headers.get('Cache-Control') || ''
    if (cacheControl === 'no-cache') {
      cacheExpires = date.relativeAge(0)
      lastModified = undefined
      etag = undefined
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
    if (cacheExpires > new Date() && !options.skipCache) {
      return cache
    }

    const response = await fetch(url, { headers: conditionalHeaders() })

    if ((etag || lastModified) && response.status == 304) {
      return cache
    }

    storeCachingDetails(response.headers)

    cache = {
      ok: response.ok,
      code: response.status,
      headers: response.headers,
      body: await response.text(),
    }

    return cache
  }
}
