const Books = require('../model/Book');
const Author = require('../model/Author');
const Users = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Orders = require('../model/Order');
class siteController {
  index(req, res, next) {
    Books.find()
      .populate('author')
      .lean()
      .then((books) => {
        Author.find().lean()
          .then((author) => {
            res.render('home', {
              books,
              author
            });
          })
      })
      .catch(next);
  }

  async createFormBook(req, res, next) {
    try {
      const author = await Author.find().lean();
      res.render('crudBook/create', {
        author
      });
    }
    catch (err) {

    }
  }
  createFormLogin(req, res, next) {
    res.render('login');
  }
  async postBook(req, res, next) {
    try {
      console.log(req.files);
      const imageFiles = req.files['images']; // Retrieve the array of image files
      const imageUrl = imageFiles.map(file => file.path); // Map the paths of image files
      console.log(imageUrl);

      const pdfFile = req.files['pdfFile'][0]; // Retrieve the single PDF file
      const pdfUrl = pdfFile.path; // Get the path of the uploaded PDF file
      console.log(pdfUrl);
      const newBook = new Books({
        ...req.body,
        images: imageUrl,
        pdfFile: pdfUrl
      });
      const saveBook = await newBook.save();
      if (req.body.author) {
        const author = Author.findById(req.body.author);
        await author.updateOne({ $push: { books: saveBook._id } });
      }
      res.status(200).json(saveBook);
    }
    catch (err) {
      res.status(500).json(err);
    }
  }
  async detailsBook(req, res, next) {
    try {
      const book = await Books.find({ slug: req.params.slug }).lean().populate('author');
      res.render('details', {
        book,
      })
    }
    catch (err) {
      res.status(500).json(err);
    }
  }
  async deleteBook(req, res) {
    try {
      await Author.updateMany(
        { books: req.params.id },
        { $pull: { books: req.params.id } }
      );
      await Books.findByIdAndDelete(req.params.id);
      res.status(200).json('deleted successfully');
    }
    catch (err) {
      res.status(500).json(err);
    }
  }
  async myBook(req, res) {
    try {
      const user = await Users.findById(req.user.id);
      const order = await Orders.find({ 'user.userID': user._id });
      const productDataArray = order.map(order => order.products.map(product => product.productData));
      const timerent = order.map(order => order.products.map(product => product.timerent));
      console.log(timerent)
      return res.render('myBook', {
        productDataArray,
        timerent
      })
    } catch (err) {
      res.status(500).json({ message: 'Server Error' });
    }
  }

  postLinkBook(req, res) {
    const productId = req.body.productID;
    Users.findById(req.user.id)
      .then(user => {
        if (!user) {
          return res.status(403).json('Not find User');
        }
        const secret = process.env.JWT_ACCESS_TOKEN + user.password;
        const token = jwt.sign({ id: user._id, productId }, secret, {
          expiresIn: '5m',
        });
        const url = `http://localhost:3000/readbook/${user._id}/${token}`;
        console.log(url);
        return res.redirect(url);
      })
      .catch(err => {
        res.status(500).json(err);
      })
  }

  //* Sau khi thanh toán xong, trang My Book sẽ lấy từ order(ktra req.user, get id from Order)
  //* Truyền productID vào các sách trong MyBook
  //*Đọc sách sẽ lấy từ id của mybook xuất ra file pdf đó

  readMyBook(req, res) { //* sẽ lấy id của sách(req.body._id), sau đó lấy pdf file từ sách đó,
    const { id, token } = req.params;
    const { productId } = jwt.decode(token);
    Users.findOne({ _id: id })
      .then(user => {
        if (!user) {
          return res.json('User not found');
        }
        const secret = process.env.JWT_ACCESS_TOKEN + user.password;
        try {
          const verify = jwt.verify(token, secret);
          Orders.find({ 'user.userID': user._id })
            .then(product => {
              const productDataArray = product.flatMap(order => order.products.map(product => product.productData));
              let specificBook = null;
              for (const book of productDataArray) {
                const bookID = String(book._id);
                if (bookID === productId) {
                  specificBook = book;
                  break;
                }
                else {
                  console.log(book._id);
                }
              }
              if (specificBook) {
                console.log(specificBook);
                res.render('my-book', {
                  specificBook
                });
              }
            })
        } catch (err) {
          res.send('not verified');
        }
      })
  }

}

module.exports = new siteController();