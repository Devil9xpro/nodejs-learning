const User = require('../models/user')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const {validationResult} = require('express-validator')

let transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "2d22f82a0e9373",
        pass: "b6f17660beb57d"
    }
});

exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req.get('Cookie').split(';')[3].trim().split('=')[1]
    let message = req.flash('error')
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null
    }
    console.log(req.session.isLoggedIn)
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message
    })
}

exports.getSignup = (req, res, next) => {
    let message = req.flash('error')
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null
    }
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage: message
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    User.findOne({email: email})
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password!')
                return res.redirect('/login')
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true
                        req.session.user = user
                        return req.session.save((err) => {
                            console.log(err)
                            res.redirect('/')
                        })
                    }
                    req.flash('error', 'Invalid email or password!')
                    res.redirect('/login')
                })
                .catch(err => {
                    console.log(err)
                    res.redirect('/login')
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
    const errors = validationResult(req)
    console.log(errors.array())
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            pageTitle: 'Signup',
            path: '/signup',
            errorMessage: errors.array()[0].msg
        })
    }
    bcrypt.hash(password, 12)
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
            const mailOptions = {
                to: email,
                from: 'shop@node-complete.com',
                subject: 'Signup succeeded',
                html: '<h1>You successfully signed up</h1>'
            }
            return transport.sendMail(mailOptions, (err, info) => {
                if (err) {
                    return console.log(err)
                }
                console.log('Message send: %s', info.messageId)
            })
        })
        .catch(err => {
            console.log(err)
        })
        .catch(err => {
            console.log(err)
        })
}

exports.getReset = (req, res, next) => {
    let message = req.flash('error')
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    })
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
            return res.redirect('/reset')
        }
        const token = buffer.toString('hex')
        User.findOne({email: req.body.email})
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with that email found!')
                    return res.redirect('/reset')
                }
                user.resetToken = token
                user.resetTokenExpiration = Date.now() + 3600000
                return user.save()
            })
            .then(result => {
                res.redirect('/')
                // transport.sendMail({
                //     to: req.body.email,
                //     from: 'shop@node-complete.com',
                //     subject: 'Password reset',
                //     html: `
                //         <p>You request a password to reset</p>
                //         <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
                //     `
                // })
                const mailOptions = {
                    to: req.body.email,
                    from: 'shop@node-complete.com',
                    subject: 'Password reset',
                    html: `
                        <p>You request a password to reset</p>
                        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
                    `
                }
                return transport.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        return console.log(err)
                    }
                    console.log('Message send: %s', info.messageId)
                })
            })
            .catch(err => {
                console.log(err)
            })
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
        .then(user => {
            let message = req.flash('error')
            if (message.length > 0) {
                message = message[0]
            } else {
                message = null
            }
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            })
        })
        .catch(err => {
            console.log(err)
        })
}

exports.postNewPassword = (req, res, next) => {
    const newPassWord = req.body.password
    const userId = req.body.userId
    const passwordToken = req.body.passwordToken
    let resetUser
    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: {$gt: Date.now()},
        _id: userId
    })
        .then(user => {
            resetUser = user
            return bcrypt.hash(newPassWord, 12)
        }).then(hashedPassword => {
            resetUser.password = hashedPassword
            resetUser.resetToken = undefined
            resetUser.resetTokenExpiration = undefined
            return resetUser.save()
        }
    )
        .then(result => {
            res.redirect('/login')
        })
        .catch(err => console.log(err))
}

