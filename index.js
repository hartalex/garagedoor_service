var express = require('express')
var routes = require('./routes/routes')
const http = require('http')
const WebSocket = require('ws')
const port = process.env.PORT || 8844
const app = express()
const expressWinston = require('express-winston')
const config = require('./config')
const wpi = require('wiringpi-node')
const winston = require('winston')
const logging = new (winston.Logger)({ 
  transports: [
    new (winston.transports.Console)({timestamp: true})
  ]
})

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
    setTimeout(sendDoorSensorChanges(ws), 500)
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
    new winston.transports.Console({
      msg: 'HTTP {{req.method}} {{req.url}}',
      colorize: true,
      timestamp: true
    })
  ]
}))

routes(app)

app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true,
      timestamp: true
    })
  ]
}))

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

function noop() {}

function heartbeat() {
  this.isAlive = true;
  logging.log('info', 'Hearbeat');
}

wss.on('connection', function connection (ws, req) {
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  setTimeout(sendDoorSensorChanges(ws), 500)
  // send initial values
  for (var i = 0; i < config.pins.length; i++) {
    var pin = config.pins[i]
    if (pin.type === 'door') {
      wpi.pullUpDnControl(pin.pin, wpi.PUD_UP)
      var pinval = wpi.digitalRead(pin.pin)
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
})

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);

server.listen(port, function listening () {
  logging.log('info', 'Listening on: ' + port)
})


