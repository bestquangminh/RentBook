const siteRouter = require('./site');
const authorRouter = require('./author');
const userRouter = require('./user');
const cartRouter = require('./cart');
const orderRouter = require('./order');
function route(app) {
    app.use('/',siteRouter);
    app.use('/author',authorRouter);
    app.use('/user', userRouter); //auth
    app.use('/cart', cartRouter);
    app.use('/order', orderRouter);
}
module.exports = route;