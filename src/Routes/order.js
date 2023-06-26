const express = require('express');
const router = express.Router();
const orderController = require('../app/controllers/orderController');
const verifyController = require('../app/middlewares/verifyController');
router.get('/', verifyController.verifyToken,orderController.getOrder);
router.post('/create-order', verifyController.verifyToken, orderController.createOrder);
module.exports = router;