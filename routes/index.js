const wpi = require('wiring-pi');

var pins = [4,17];

module.exports = function(req, res) {
  var output = []; 
  wpi.wiringPiSetupGpio();
  pins.forEach(function(pin) { 
    wpi.pinMode(pin,wpi.INPUT);
    wpi.pullUpDnControl(pin,wpi.PUD_UP);
    var pinval = wpi.digitalRead(pin);
    console.log(pinval);
    output.push({"sensorId":"gd-000000"+pin,"isOpen":pinval==1});
  });
  res.json(output);
}
