module.exports = function(fetchData, emit, options) {
  let processedBody
  let last = {
    response: { code: null, body: null },
    success: { code: null, body: null },
    failure: { code: null, body: null },
  }

  return async function() {
    try {
      const { ok, code, headers, body } = await fetchData()
      const responseType = ok ? 'success' : 'failure'

      processedBody = options.json ? JSON.parse(body) : body

      if (
        options.emitUnchanged ||
        last['response'].code !== code ||
        last['response'].body !== body
      ) {
        emit('response', code, headers, processedBody)
      }

      if (
        options.emitUnchanged ||
        last[responseType].code !== code ||
        last[responseType].body !== body
      ) {
        emit(responseType, processedBody)
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
