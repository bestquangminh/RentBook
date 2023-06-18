const express = require('express');
const morgan = require('morgan');
const handlebars = require('express-handlebars').engine;
require('dotenv').config();
const path = require('path');
const app = express();
const port = 3000;
app.use(morgan('combined'));
const route = require('./Routes/index');
const db = require('./config/db');
db.connect();
//* Template engine
app.engine('hbs', handlebars({
  extname: '.hbs',
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname,'Resources/views'));
app.use(express.static(path.join(__dirname, 'public/')));
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());
//*Route init
route(app);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
