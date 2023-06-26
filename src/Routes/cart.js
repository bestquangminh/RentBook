const express = require('express');
const cartController = require('../app/controllers/cartController');
const verifyController = require('../app/middlewares/verifyController');
const router = express.Router();

router.post('/addcart', verifyController.verifyToken, cartController.addCart);
router.get('/', verifyController.verifyToken, cartController.getCart);
router.post('/deleteCartItem',verifyController.verifyToken, cartController.deleteItemsCart);
router.post('/create_payment_url', cartController.postPaymentUrl);
module.exports = router;