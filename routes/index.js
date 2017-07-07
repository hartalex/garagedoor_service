const wpi = require('wiringpi-node')

var pins = [4, 22]

module.exports = function (req, res) {
  var output = []
  wpi.wiringPiSetupGpio()
  pins.forEach(function (pin) {
    wpi.pinMode(pin, wpi.INPUT)
    wpi.pullUpDnControl(pin, wpi.PUD_UP)
    var pinval = wpi.digitalRead(pin)
    console.log(pinval)
    output.push({'sensorId': 'gd-000000' + pin, 'isOpen': pinval === 1})
  })
  res.json(output)
}
