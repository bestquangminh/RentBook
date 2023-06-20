const Users = require('../model/User');

class cartController {
    async getCart(req,res) {
        res.render('cart');
    }
}

module.exports = new cartController();