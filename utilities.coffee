# Convert a date to iso8601 format.  Based on
# https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date#Example.3a_ISO_8601_formatted_dates
exports.iso8601 = (d) ->
  return null if d is null
  pad = (n) -> if n<10 then '0'+n else n
  "#{d.getUTCFullYear()}-#{pad(d.getUTCMonth()+1)}-#{pad(d.getUTCDate())}T#{pad(d.getUTCHours())}:#{pad(d.getUTCMinutes())}:#{pad(d.getUTCSeconds())}Z"
