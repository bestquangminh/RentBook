const Users = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { text } = require('body-parser');
const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.sendgrid_apiKey
  }
}))
let refreshTokenArray = [];
class userController {
  async registerUsers(req, res, next) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      //* Create new user
      const newUser = await new Users({
        username: req.body.username,
        gmail: req.body.gmail,
        password: hash,
      });
      //* Save to database
      const user = await newUser.save();
      res.redirect('/loginform');
    } catch (err) {
      res.status(500).json(err);
    }
  }
  async loginUsers(req, res, next) {
    try {
      const user = await Users.findOne({ username: req.body.username });
      if (!user) {
        res.status(404).json('wrong username');
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password,
      );
      if (!validPassword) {
        res.status(404).json('wrong password');
      }
      if (user && validPassword) {
        const accessToken = jwt.sign(
          {
            id: user.id,
            admin: user.admin,
          },
          process.env.JWT_ACCESS_TOKEN,
          { expiresIn: '24h' },
        );
        const refreshToken = jwt.sign(
          {
            id: user.id,
            admin: user.admin,
          },
          process.env.JWT_REFRESH_TOKEN, //* secret key
          { expiresIn: '365d' }, //* expried day
        );
        refreshTokenArray.push(refreshToken);
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          path: '/',
          sameSite: 'strict',
        });
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          path: '/',
          sameSite: 'strict',
        });
        // ! hide password in json
        const { password, ...others } = user._doc; //* user._doc là các dữ liệu của user trong mongoDB\
        res.status(200).json({ ...others, accessToken });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }
  async userLogout(req, res) {
    try {
      res.clearCookie('refreshToken');
      refreshTokenArray = refreshTokenArray.filter(
        (token) => token !== req.cookies.refreshToken,
      );
      res.clearCookie('accessToken');
      accessToken = accessToken.filter(
        (token) => token !== req.cookies.accessToken,
      );
      res.status(200).json('logged out !');
    } catch (err) {
      res.status(500).json(err);
    }
  }
  async getAllUsers(req, res) {
    try {
      const users = await Users.find().lean();
      res.status(200).json(users);
    }
    catch (err) {
      res.status(500).json(err);
    }
  }
  forgetPasswordform(req, res) {
    res.render('forgetPasswordForm');
  }
  forgotPassword(req, res) {
    const gmailInput = req.body.gmail;
    console.log(gmailInput);
    Users.findOne({ gmail: gmailInput })
      .then(user => {
        if (!user) {
          return res.status(403).json('Not find User');
        }
        const secret = process.env.JWT_ACCESS_TOKEN + user.password;
        const token = jwt.sign({ gmailInput: user.gmailInput, id: user._id }, secret, {
          expiresIn: '5m',
        });
        const link = process.env.linkResetPasswordAPI + `${user._id}/${token}`;
        transporter.sendMail({
          to: gmailInput, //! gmailInput
          from: 'bestquangminh@gmail.com',
          subject: 'Link To Reset Password',
          text: link
        })
        return res.status(200).json('success');
      })
      .catch(err => {
        res.status(500).json(err);
      })
  }
  resetPassword(req, res) {
    const { id, token } = req.params;
    console.log(req.params);
    Users.findOne({ _id: id })
      .then(user => {
        if (!user) {
          return res.json('User not found');
        }
        const secret = process.env.JWT_ACCESS_TOKEN + user.password;
        try {
          const verify = jwt.verify(token, secret);
          res.render('change-password', {
            gmail: user.gmail,
            id: user.id,
            token: req.params.token
          });
        } catch (err) {
          res.send('not verified');
        }
      })
  }
  async postResetPassword(req, res) {
    const { id, token } = req.params;
    const { password } = req.body;
    try {
      const user = await Users.findOne({ _id: id });
      if (!user) {
        return res.json('User not found');
      }
      const secret = process.env.JWT_ACCESS_TOKEN + user.password;
      const verify = jwt.verify(token, secret);
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      // Update the user's password with the hashed password
      await Users.updateOne({ _id: id }, {
        $set: {
          password: hash,
        },
      });
      res.redirect('/')
    } catch (err) {
      console.error(err);
      res.send('Not verified');
    }
  }

}

module.exports = new userController();
