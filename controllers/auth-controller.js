const User = require('../models/user')
const bcrypt = require('bcryptjs')

exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req.get('Cookie').split(';')[3].trim().split('=')[1]
    console.log(req.session.isLoggedIn)
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: false
    })
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        isAuthenticated: false
    })
}

exports.postLogin = (req, res, next) => {
    User.findById('60fd30bacf328237e4c0b2e7')
        .then(user => {
            req.session.isLoggedIn = true
            req.session.user = user
            req.session.save((err) => {
                console.log(err)
                res.redirect('/')
            })
        })
        .catch(err => console.log(err))
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err)
        res.redirect('/')
    })
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword

    User.findOne({email: email})
        .then(userDoc => {
            if (userDoc) {
                return res.redirect('/signup')
            }
            return bcrypt.hash(password, 12)
        })
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: {items: []}
            })
            return user.save()
        })
        .then(result => {
            res.redirect('/login')
        })
        .catch(err => {
            console.log(err)
        })

}
