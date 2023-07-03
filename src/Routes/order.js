const express = require('express');
const router = express.Router();
const orderController = require('../app/controllers/orderController');
const verifyController = require('../app/middlewares/verifyController');
router.get('/', verifyController.verifyToken,orderController.getOrder);

//*VISA PAYMENT
router.get('/checkout/success', orderController.getOrderSuccess);
router.get('/checkout/cancel', verifyController.verifyToken, orderController.getOrder);

router.post('/create-order', verifyController.verifyToken, orderController.createOrder);

//*VNPAY PAYMENT
router.post('/create_payment_url', verifyController.verifyToken, orderController.postVNPAYPaymet);
router.get('/vnpay_ipn', verifyController.verifyToken, orderController.getvnPayIPN);
module.exports = router;