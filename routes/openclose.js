const wpi = require('wiring-pi');

var pin = 23;

module.exports = function(req, res) {
  var output = []; 
  wpi.wiringPiSetupGpio();
    wpi.pinMode(pin,wpi.OUTPUT);
    wpi.digitalWrite(pin,0);

    setTimeout(function(){
      wpi.digitalWrite(pin,1);
      res.json(output);
    }, 500);
}
