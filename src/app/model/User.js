const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const usersSchema = new Schema(
    {
      username: { type: String, minlength: 6, required: true, unique: true },
      gmail: { type: String, minlength: 6, required: true, unique: true },
      password: { type: String, minlength: 6, required: true },
      admin: { type: Boolean, default: false },
      cart: {
        items: [
          {
            productID: {type: Schema.Types.ObjectId, ref: 'book', required: true},
            quantity: {type: Number, required: true}
          }
        ],
      }
    },
    {
      timestamps: true,
    },
  );
const Users = mongoose.model('user', usersSchema);
module.exports = Users;