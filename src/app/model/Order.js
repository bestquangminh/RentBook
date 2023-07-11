const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    // ngày thuê, ngày hệt hạn, tổng tiền
  products: [{
      productData: {type: Object, required: true},
      timerent: {type: Date, required: true},
      dayrent: {type: Number}
  }],
  user: {
    name: {type: String, required: true},
    userID: {type: Schema.Types.ObjectId, required: true, ref: 'Users'},
  },
  dayrent: {type: Number}
},
  {
    timestamps: true,
  },
);
const Orders = mongoose.model('order', orderSchema);
module.exports = Orders;