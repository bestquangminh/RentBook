const express = require('express');
const router = express.Router();
const siteController = require('../app/controllers/siteController');
router.get('/', siteController.index);
router.get('/createForm', siteController.createFormBook);
router.post('/postbook', siteController.postBook);
router.get('/details/:slug', siteController.detailsBook);
router.delete('/:id', siteController.deleteBook);
module.exports = router;