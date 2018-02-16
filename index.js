var express = require('express')
var routes = require('./routes/routes')
const port = process.env.PORT || 8844
const app = express()
const expressWinston = require('express-winston')
const config = require('./config')
const wpi = require('wiringpi-node')
const logging = require('winston')

// Setup GPIO
wpi.wiringPiSetupGpio()
for (var i = 0; i < config.pins.length; i++) {
  var pin = config.pins[i]
  if (pin.type === 'door') {
    // Set Input Pins
    wpi.pinMode(pin.pin, wpi.INPUT)
    wpi.pullUpDnControl(pin.pin, wpi.PUD_UP)
    logging.log('info', 'Setting ' + pin.pin + ' to INPUT', pin)
  } else if (pin.type === 'relay') {
    // Set Output Pins
    wpi.pinMode(pin.pin, wpi.OUTPUT)
    logging.log('info', 'Setting ' + pin.pin + ' to OUTPUT', pin)
  }
}

// Middleware to add gpio to requests
app.use(function (req, res, next) {
  req.gpio = wpi
  next()
})

app.use(expressWinston.logger({
  transports: [
    new logging.transports.Console({
      msg: 'HTTP {{req.method}} {{req.url}}',
      colorize: true
    })
  ]
}))

routes(app)

app.use(expressWinston.errorLogger({
  transports: [
    new logging.transports.Console({
      json: true,
      colorize: true
    })
  ]
}))

app.listen(port)
