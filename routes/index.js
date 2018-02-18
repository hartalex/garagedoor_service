const wpi = require('wiringpi-node')

var pins = [10, 27,17]
var outids = [4, 22, 17]

module.exports = function (req, res) {
  var output = []
  wpi.wiringPiSetupGpio()
  for (var i = 0; i < pins.length; i++) {
    var pin = pins[i]
    wpi.pinMode(pin, wpi.INPUT)
    wpi.pullUpDnControl(pin, wpi.PUD_UP)
    var pinval = wpi.digitalRead(pin)
    console.log(pinval)
    output.push({'sensorId': 'gd-000000' + outids[i], 'isOpen': pinval === 1})
  }
  res.json(output)
}
