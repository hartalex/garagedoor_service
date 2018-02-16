const WebSocket = require('ws')
const logging = require('winston')

var ws

const close = function () {
  logging.log('info', 'WebSocket Closed')
  tryreconnect()
}

const errorfunc = function (error) {
  logging.log('error', 'WebSocket Issue', error)
  tryreconnect()
}

const incomming = function (message) {
  var obj = JSON.parse(message)
  logging.log('debug', 'WebSocket Receive Message: ', obj)
}

const reconnect = () => {
  logging.log('info', 'Connect to Websocket')
  try {
    ws = new WebSocket('ws://127.0.0.1:8844')
    ws.on('message', incomming)
    ws.on('close', close)
    ws.on('error', errorfunc)
  } catch (error) {
    logging.log('error', 'WebSocket Connection Error: ', error)
    tryreconnect()
    logging.log('error', 'WebSocket Connection Error: ', ws)
  }
}

const tryreconnect = () => {
  setTimeout(reconnect, 30000) // 30 seconds
}

reconnect()
