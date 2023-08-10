const Books = require('../model/Book');
const Author = require('../model/Author');
const Users = require('../model/User');
const Orders = require('../model/Order');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
class siteController {
  async index(req, res, next) {
    try {
      const addtocartAPI = process.env.addtocartAPI
      const books = await Books.find().populate('author').lean();
      const author = await Author.find().lean();
      res.render('home', {
        books,
        author,
        addtocartAPI
      })
    } catch {
      res.status(500);
    }
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
    const loginAPI = process.env.loginAPI
    res.render('login', {
      loginAPI
    });
  }
  createFormRegister(req, res, next) {
    res.render('register');
  }
  async postBook(req, res, next) {
    try {
      const imageFiles = req.files['images']; // Retrieve the array of image files
      const imageUrl = imageFiles.map(file => file.path); // Map the paths of image files

      const pdfFile = req.files['pdfFile'][0]; // Retrieve the single PDF file
      const pdfUrl = pdfFile.path; // Get the path of the uploaded PDF file
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
      const book = await Books.findOne({ slug: req.params.slug }).lean().populate('author');
      const authorBook = await Books.find({ author: book.author._id }).lean();
      const addToCartAPI = process.env.addtocartAPI
      console.log(authorBook);
      res.render('details', {
        book,
        authorBook,
        addToCartAPI
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

  async postLinkBook(req, res) {
    try {
      const productId = req.body.productID;
      const user = await Users.findById(req.user.id);
      const order = await Orders.findOne({ 'user.userID': user._id });
      console.log(order);
      if (!user) {
        return res.status(403).json('Not find User');
      }
      const secret = process.env.JWT_ACCESS_TOKEN + user.password;
      const token = jwt.sign({ id: user._id, productId }, secret, {
        expiresIn: '5m',
      });
      const url = `http://localhost:3000/readbook/${user._id}/${token}`;
      console.log(url);
      return res.status(200).json({ url });
    } catch (err) {
      return res.status(500).json(err);
    }
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

  async getChart(req, res) {
    try {
      const result = await Orders.aggregate([
        {
          $unwind: "$products"
        },
        {
          $group: {
            _id: "$products.productData",
            count: { $sum: 1 }
          }
        }
      ]);
      const labels = result.map(item => item._id.name);
      const counts = result.map(item => item.count);

      // Prepare the response
      const response = {
        labels: labels,
        counts: counts
      };
      res.render('chartOrder', {
        response
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err: 'An error occurred' });
    }
  }

}

module.exports = new siteController();