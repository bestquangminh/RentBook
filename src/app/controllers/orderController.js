const Orders = require('../model/Order');
const Users = require('../model/User');
class orderController {
  getOrder(req, res) {
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
        res.render('order', {
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

  createOrder(req, res) {
    const selectedDate = new Date(req.body.date);
    console.log(selectedDate);
    const currentDate = new Date();
    console.log(currentDate);

    // Calculate the time difference in milliseconds
    const timeDifference = selectedDate.getTime() - currentDate.getTime();

    // Convert the time difference to days
    //const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

    console.log(timeDifference);
    Users.findById(req.user.id)
      .populate('cart.items.productID')
      .exec()
      .then(user => {
        const products = user.cart.items.map(i => {
          return { productData: { ...i.productID._doc }, timerent:timeDifference  };
        });
        console.log(products);
        const order = new Orders({
          user: {
            name: user.username,
            userID: req.user.id
          },
          products: products
        });
        return order.save()
          .then(() => {
            user.cart.items = [];
            return user.save();
          });
      })
      .then(result => {
        res.redirect('/');
      })
      .catch(err => { console.log(err) });
  }
}
module.exports = new orderController();