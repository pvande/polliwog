module.exports = function(fetchData, emit, options) {
  let last = {
    response: { code: null, body: null, processed: null },
    success: { body: null, processed: null },
    failure: { body: null, processed: null },
  }

  const process = body => (options.json ? JSON.parse(body) : body)

  return async function() {
    try {
      const { ok, code, headers, body } = await fetchData()
      const event = ok ? 'success' : 'failure'

      // Detect changes from previously emitted responses.
      const newResponseCode = last['response'].code !== code
      const newResponseBody = last['response'].body !== body
      const newEventBody = last[event].body !== body

      // Log currently processing data
      last['response'].code = code
      last['response'].body = last[event].body = body

      // Process new body data, reusing existing data whenever possible.
      if (!newResponseBody) {
        last[event].processed = last['response'].processed
      } else if (!newEventBody) {
        last['response'].processed = last[event].processed
      } else {
        last['response'].processed = last[event].processed = process(body)
      }

      // Emit data to the appropriate event streams.
      if (options.emitUnchanged || newResponseCode || newResponseBody) {
        emit('response', code, headers, last['response'].processed)
      }
      if (options.emitUnchanged || newEventBody) {
        emit(event, last['response'].processed)
      }
    } catch (err) {
      emit('error', err)
    } finally {
      emit('poll')
    }
  }
}
