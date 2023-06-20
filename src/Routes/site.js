const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileStorage = multer.diskStorage({
    destination:(req,file,cb) => {
        cb(null, 'src/public/images');
    },
    filename: (req,file,cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-')+ '-' + file.originalname);
    }
})
const fileFilter = (req,file,cb) => {
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    } else {
        cb(null, false);
    }
}
const upload = multer({storage:fileStorage, fileFilter: fileFilter });
const siteController = require('../app/controllers/siteController');
router.get('/', siteController.index);
router.get('/createForm', siteController.createFormBook);
router.post('/postbook', upload.single('images'), siteController.postBook);
router.get('/details/:slug',siteController.detailsBook);
router.delete('/:id', siteController.deleteBook);
router.post('/test', siteController.postLinkBook); //* sau khi thanh toán sẽ đc post qua route này
router.get('/readbook/:id/:token', siteController.readMyBook);
module.exports = router;

