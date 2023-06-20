const express = require('express');
const cartController = require('../app/controllers/cartController');
const router = express.Router();

router.get('/', cartController.getCart);
module.exports = router;