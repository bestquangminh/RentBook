const Books = require('../model/Book');
const Author = require('../model/Author');
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
      
}

module.exports = new siteController();