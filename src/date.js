const msSinceEpoch = date => new Date(date).getTime() || 0
const difference = (date, offset) => msSinceEpoch(offset) - msSinceEpoch(date)
const msFromNow = n => new Date(new Date().getTime() + n)

const relativeAge = seconds => msFromNow(1000 * seconds)
const relativeExpires = (date, exp) => msFromNow(difference(date, exp))

module.exports = { relativeAge, relativeExpires }
