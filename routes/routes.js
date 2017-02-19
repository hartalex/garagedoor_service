const index = require('./index.js')
const openclose = require('./openclose.js')
module.exports = function(app) {

app.get('/', index);
app.get('/openclose', openclose);

}
