var express = require('express')
var routes = require('./routes/routes')
const http = require('http')
const WebSocket = require('ws')
const port = process.env.PORT || 8844
const app = express()
const expressWinston = require('express-winston')
const config = require('./config')
const wpi = require('./test/WiringPiMock') // require('wiringpi-node')
const logging = require('winston')

const sendDoorSensorChanges = function (ws) {
  return () => {
    var myerror = false
    for (var i = 0; i < config.pins.length; i++) {
      var pin = config.pins[i]
      if (pin.type === 'door') {
        wpi.pullUpDnControl(pin.pin, wpi.PUD_UP)
        var pinval = wpi.digitalRead(pin.pin)
        if (config.pins[i].value !== (pinval === 1)) {
          config.pins[i].value = (pinval === 1)
          var message = JSON.stringify({'sensorId': pin.id, 'isOpen': config.pins[i].value})
          logging.log('info', 'Sending Data', message)
          ws.send(message, function ack (error) {
            if (typeof error !== 'undefined') {
              logging.log('error', 'Websocket Send ERROR', error)
              myerror = true
            }
          })
        }
      }
    }
    if (!myerror) {
      setTimeout(sendDoorSensorChanges(ws), 500)
    }
  }
}

// Setup GPIO
wpi.wiringPiSetupGpio()
for (var i = 0; i < config.pins.length; i++) {
  var pin = config.pins[i]
  if (pin.type === 'door') {
    // Set Input Pins
    wpi.pinMode(pin.pin, wpi.INPUT)
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

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

wss.on('connection', function connection (ws, req) {
  setTimeout(sendDoorSensorChanges(ws), 500)
})

server.listen(port, function listening () {
  logging.log('info', 'Listening on: ' + port)
})
