module.exports = function(fetchData, emit, options = {}) {
  let lastOk, lastResult, processedResult
  return async function() {
    try {
      const [ok, result] = await fetchData()

      if (ok === lastOk && result === lastResult) {
        if (!options.emitUnchanged) {
          return
        }
      } else {
        lastOk = ok
        lastResult = result
        processedResult = options.json ? JSON.parse(result) : result
      }

      emit('response', processedResult)
      emit(ok ? 'success' : 'failure', processedResult)
    } catch (err) {
      emit('error', err)
    } finally {
      emit('poll')
    }
  }
}
