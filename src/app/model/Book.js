const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var slug = require('mongoose-slug-updater');
// var mongooseDelete = require('mongoose-delete');
const bookSchema = new Schema(
  {
    name: { type: String, maxLength: 255, require: true},
    // thêm giá nhập & đọc trước
    price: { type: Number,require:true},
    description: { type: String,require:true },
    author: {type: mongoose.Schema.Types.ObjectId,ref: 'author'},
    genres: { type: [String],require:true},
    images: [{ type: String, maxLength: 255, require:true }],
    src: {type: String},
    slug: { type: String, slug: 'name', unique: true },
  },
  {
    timestamps: true,
  },
);
// const orderSchema = new Schema({
//     // ngày thuê, ngày hệt hạn, tổng tiền
//   products: [{
//       productData: {type: Object, required: true},
//   }],
//   user: {
//     name: {type: String, required: true},
//     userID: {type: Schema.Types.ObjectId, required: true, ref: 'Users'},
//   },
// },
//   {
//     timestamps: true,
//   },
// );
mongoose.plugin(slug);
const Books = mongoose.model('book', bookSchema);
module.exports = Books;