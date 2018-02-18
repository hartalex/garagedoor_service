const config = require('../config')

module.exports = function (req, res) {
  var output = []
  var gpio = req.gpio
  for (var i = 0; i < config.pins.length; i++) {
    var pin = config.pins[i]
    if (pin.type === 'door') {
      gpio.pullUpDnControl(pin.pin, gpio.PUD_UP)
      var pinval = gpio.digitalRead(pin.pin)
      output.push({'sensorId': pin.id, 'isOpen': pinval === 1})
    }
  }
  res.json(output)
}
