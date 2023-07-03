const express = require('express');
const router = express.Router();
const userController = require('../app/controllers/userController');
const verifyController = require('../app/middlewares/verifyController');
router.post('/register', userController.registerUsers);
router.post('/login', userController.loginUsers);
router.post(
    '/logout',
    verifyController.verifyToken,
    userController.userLogout,
  );
router.get('/getAllUser', verifyController.verifyToken, userController.getAllUsers);

module.exports = router;