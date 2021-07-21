const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error-controller');
const sequelize = require('./util/database')
const Product = require('./models/product')
const User = require('./models/user')

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin-router');
const shopRoutes = require('./routes/shop-router');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            req.user = user
            next()
        })
        .catch(err => console.log(err))
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, {
    constraints: true,
    //delete User, any product related to user will gone
    onDelete: 'CASCADE'
})
User.hasMany(Product)
//sync : create table in database
sequelize
    // .sync({
    //     force: true
    // })
    .sync()
    .then(result => {
        return User.findByPk(1)
    })
    .then(user => {
        if (!user) {
            return User.create({
                name: 'Chinh',
                email: '12test@test.com'
            })
        }
        return user
    })
    .then(user => {
        console.log(user)
        app.listen(3000)
    })
    .catch(err => console.log(err))