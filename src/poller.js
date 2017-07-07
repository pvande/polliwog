const { ABORT } = require('./fetcher')

module.exports = function(fetchData, emit, options = {}) {
  let lastOk, lastResult, processedResult
  return async function() {
    try {
      const [ok, result] = await fetchData()

      if (ok === lastOk && result === lastResult) {
        return
      } else {
        lastOk = ok
        lastResult = result
      }

      processedResult = options.json ? JSON.parse(result) : result

      emit('response', processedResult)
      emit(ok ? 'success' : 'failure', processedResult)
    } catch (err) {
      if (err !== ABORT) {
        emit('error', err)
      }
    } finally {
      emit('poll')
    }
  }
}
