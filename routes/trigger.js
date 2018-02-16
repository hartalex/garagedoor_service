const config = require('../config')
const logging = require('winston')

module.exports = function (req, res) {
  var obj = req.body
  var gpio = req.gpio
  var pin = -1
  for (var i = 0; i < config.pins.length; i++) {
    if (config.pins[i].type === 'relay' && obj.sensorId === config.pins[i].id) {
      pin = config.pins[i]
    }
  }
  if (pin !== -1) {
    logging.log('info', 'Open/Closing ' + pin.pin)
    gpio.digitalWrite(pin.pin, 0)
    setTimeout(function () {
      gpio.digitalWrite(pin.pin, 1)
      res.json({ok: true})
    }, 500)
  } else {
    res.json({ok: false})
  }
}
