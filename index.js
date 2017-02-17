var express = require('express');
var routes = require('./routes/routes');
const port = process.env.PORT || 8844;
const app = express();

routes(app);

app.listen(port);
