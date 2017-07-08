module.exports = function(fetchData, emit, options) {
  let last = {
    response: { code: null, body: null, processed: null },
    success: { code: null, body: null, processed: null },
    failure: { code: null, body: null, processed: null },
  }

  const process = body => (options.json ? JSON.parse(body) : body)

  return async function() {
    try {
      const { ok, code, headers, body } = await fetchData()
      const responseType = ok ? 'success' : 'failure'

      const newResponseCode = last['response'].code !== code
      const newResponseBody = last['response'].body !== body
      const newTypedCode = last[responseType].code !== code
      const newTypedBody = last[responseType].body !== body

      last['response'].processed = process(body)
      last[responseType].processed = process(body)

      if (options.emitUnchanged || newResponseCode || newResponseBody) {
        emit('response', code, headers, last['response'].processed)
      }

      if (options.emitUnchanged || newTypedCode || newTypedBody) {
        emit(responseType, last['response'].processed)
      }

      last['response'].code = last[responseType].code = code
      last['response'].body = last[responseType].body = body
    } catch (err) {
      emit('error', err)
    } finally {
      emit('poll')
    }
  }
}
