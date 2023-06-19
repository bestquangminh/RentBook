const Books = require('../model/Book');
const Author = require('../model/Author');
const Users = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
class siteController {
    index(req, res, next) {
        Books.find()
          .lean()
          .then((books) => {
            res.json(books);
          })
          .catch(next);
      }

    async createFormBook(req,res,next) {
      try {
        const author = await Author.find().lean();
        console.log(author);
        res.render('crudBook/create', {
          author
        });
      }
      catch (err) {

      }
    }
   async postBook(req, res, next) {
      try {
        const newBook = new Books(req.body);
        const saveBook = await newBook.save();
        if(req.body.author) {
          const author = Author.findById(req.body.author);
          await author.updateOne({$push: {books: saveBook._id}});
        }
        res.status(200).json(saveBook);
      }
      catch (err) {
        res.status(500).json(err);
      }
    }
    async detailsBook(req, res, next)  {
      try {
        const book = await Books.find({slug: req.params.slug}).lean();
        res.render('details', {
          book
        })
      }
      catch (err) {
        res.status(500).json(err);
      }
    }
    async deleteBook(req,res) {
      try {
        await Author.updateMany(
          {books: req.params.id},
          {$pull: {books: req.params.id}}
        );
        await Books.findByIdAndDelete(req.params.id);
        res.status(200).json('deleted successfully');
      }
      catch (err) {
        res.status(500).json(err);
      }
    }
     readBook(req, res) {
      const gmailInput = req.body.gmail;
      console.log(gmailInput);
      Users.findOne({gmail:gmailInput})
      .then(user =>{
        if(!user){
          return res.status(403).json('Not find User');
        }
        console.log(user);
        const secret = process.env.JWT_ACCESS_TOKEN + user.password;
        const token = jwt.sign({gmailInput: user.gmailInput, id: user._id}, secret, {
          expiresIn: '5m',
        });
        const link = `http://localhost:3000/readbook/${user._id}/${token}`;   
        console.log(link);     
        return res.status(200).json('success');
      })
      .catch(err => {
        res.status(500).json(err);
      })
    }
    
    myBook(req,res) {
      const {id, token} = req.params;
      console.log(req.params);
      Users.findOne({_id: id})
        .then(user => {
          if(!user){
            return res.json('User not found');
          }
          const secret = process.env.JWT_ACCESS_TOKEN + user.password;
          try {
            const verify = jwt.verify(token, secret);
            res.render('my-book');
          }catch(err) {
            res.send('not verified');
          }
        })
    }
      
}

module.exports = new siteController();