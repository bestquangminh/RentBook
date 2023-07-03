const Users = require('../model/User');
const Books = require('../model/Book');
class cartController {
  addCart(req, res, next) {
    const productID = req.body.productID;
    if (productID) {
      Books.findById(productID)
        .then(book => {
          Users.findById(req.user.id)
            .then(user => {
              return user.addToCart(book);
            })
        })
        .then(result => {
          res.redirect('back');
        })
        .catch(err => { console.log(err) });
    }
    else {
      return res.status(400).json({ message: "book not found" });
    }
  }
  async getCart(req, res) {
    Users.findById(req.user.id)
      .populate('cart.items.productID')
      .exec()
      .then(user => {
        const cartItems = user.cart.items;
        const cartItemCount = cartItems.length;
        let totalPrice = 0;
        cartItems.forEach(p => {
          totalPrice += p.productID.price;
        })
        res.render('cart', {
          cartItems,
          totalPrice,
          cartItemCount
        })
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ message: 'Server Error' });
      });
  }
   postCart(req, res) {
      const selectedDate = new Date(req.body.date);
      console.log(selectedDate);
      const currentDate = new Date();
      selectedDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      // Convert the time difference to days
      const daysDifference = Math.ceil((selectedDate - currentDate) / (1000 * 3600 * 24));
      Users.findById(req.user.id)
        .then(user => {
          user.updateToCart(selectedDate,daysDifference);
          res.redirect('/order');
        })
        .then(()=> {
          return res.status(200);
        })
        .catch(err => {
          return res.json(err);
        })
  }
  deleteItemsCart(req, res) {
    const productID = req.body.productId;
    if (productID) {
      Users.findById(req.user.id)
        .then(user => {
          return user.removeFromCart(productID);
        })
        .then(result => {
          res.redirect('back');
        })
        .catch(err => { console.log(err) });
    }
    else {
      return res.status(400).json({ message: "Course not found" });
    }

  }
  postPaymentUrl(req, res, next) {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');

    let ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    let config = require('config');

    let tmnCode = process.env.vnp_TmnCode;
    let secretKey = process.env.vnp_HashSecret;
    let vnpUrl = process.env.vnp_Url;
    let returnUrl = process.env.vnp_Api;
    let orderId = moment(date).format('DDHHmmss');
    let amount = req.body.amount;
    let bankCode = req.body.bankCode;

    let locale = req.body.language;
    if (locale === null || locale === '') {
      locale = 'vn';
    }
    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode !== null && bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    res.redirect(vnpUrl)
  }

}

module.exports = new cartController();