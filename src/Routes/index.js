const siteRouter = require('./site');
const authorRouter = require('./author');
const userRouter = require('./user');
function route(app) {
    app.use('/',siteRouter);
    app.use('/author',authorRouter);
    app.use('/user', userRouter);
}
module.exports = route;