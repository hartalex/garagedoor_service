const wpi = require('wiring-pi');

var pins = [23, 24];

module.exports = function(req, res) {
  var output = []; 
    var obj = req.body 
    wpi.wiringPiSetupGpio();
    var pin = -1 
    if (obj.sensorId === 'gd-0000004') {
      pin = pins[0]
    } else if (obj.sensorId === 'gd-00000022') {
      pin = pins[1]
    } 
    if (pin != -1) { 
      wpi.pinMode(pin,wpi.OUTPUT);
      wpi.digitalWrite(pin,0);

      setTimeout(function(){
        wpi.digitalWrite(pin,1);
        res.json({ok:true});
      }, 500);
    } else {
      res.json({ok:false});
    }
}
