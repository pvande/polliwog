module.exports.secondsFromNow = n => {
  return new Date(new Date().getTime() + 1000 * n)
}

module.exports.calculateSkew = (date, offset) => {
  const parsedDate = new Date(date).getTime() || 0
  const parsedOffset = new Date(offset).getTime() || 0

  return (parsedOffset - parsedDate) / 1000
}
