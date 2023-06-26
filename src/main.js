const express = require('express');
const morgan = require('morgan');
const handlebars = require('express-handlebars').engine;
require('dotenv').config();
var bodyParser = require('body-parser');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const multer = require('multer');
const upload = multer({dest:''});
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;
app.use(morgan('combined'));
const route = require('./Routes/index');
const db = require('./config/db');
db.connect();
//* Template engine
app.engine('hbs', handlebars({
  extname: '.hbs',
  handlebars: allowInsecurePrototypeAccess(require('handlebars')),
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname,'Resources/views'));
app.use('/src/public/',express.static(path.join(__dirname, 'public/')));
app.use('/src/public/images',express.static(path.join(__dirname, 'public/images')));
app.use('/src/public/PDF',express.static(path.join(__dirname, 'public/PDF')));
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
//*Route init
route(app);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
