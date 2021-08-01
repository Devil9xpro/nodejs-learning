const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDbStore = require('connect-mongodb-session')(session)

const errorController = require('./controllers/error-controller');
const User = require('./models/user');

const MongoDB_URI = 'mongodb://localhost:27017/shop'

const app = express();
const store = new MongoDbStore({
    uri: MongoDB_URI,
    collection: 'session'
})

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin-router');
const shopRoutes = require('./routes/shop-router');
const authRoutes = require('./routes/auth-router');


app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'my secret', resave: false, saveUninitialized: false, cookie: {}, store: store}))

app.use((req, res, next) => {
    if(!req.session.user){
        return next()
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user
            next()
        })
        .catch(err => console.log(err))
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect(MongoDB_URI)
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'DavidNguyen',
                    email: 'chinh@test.com',
                    cart: {
                        items: []
                    }
                })
                user.save()
            }
        })
        app.listen(3000)
    })
    .catch(err => console.log(err))
