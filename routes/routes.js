const index = require('./index.js')
const trigger = require('./trigger.js')
const bodyParser = require('body-parser')

const jsonParser = bodyParser.json()

module.exports = function (app) {
  app.get('/', index)
  app.post('/trigger', jsonParser, trigger)
}
