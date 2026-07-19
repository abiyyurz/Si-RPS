// Preload untuk memaksa resolusi IPv4 (jaringan ini IPv6-nya mati/timeout).
// Pakai: set NODE_OPTIONS=--require ./scripts/force-ipv4.cjs
const dns = require('dns')
const orig = dns.lookup
dns.lookup = function (hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  } else if (typeof options === 'number') {
    options = { family: options }
  }
  return orig.call(dns, hostname, { ...options, family: 4 }, callback)
}
