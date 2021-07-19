const products = []
const path = require('path')
const fs = require('fs')
const {
    getProducts
} = require('../controllers/admin-controller')
const p = path.join(path.dirname(process.mainModule.filename), 'data', 'product.json')

const getProductsFromFile = cb => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            cb([])
        } else {
            try {
                cb(JSON.parse(fileContent))
            } catch {
                return cb([])
            }
        }
    })
}

module.exports = class Product {
    constructor(title, imageUrl, description, price) {
        this.title = title
        this.imageUrl = imageUrl
        this.description = description
        this.price = price
    }

    save() {
        this.id = Math.random().toString;
        getProductsFromFile(products => {
            products.push(this)
            fs.writeFile(p, JSON.stringify(products), err => {
                console.log(err)
            })
        });
    }

    static fetchAll(cb) {
        getProductsFromFile(cb)
    }

    static findById(id, cb) {
        getProductsFromFile(products => {
            const product = products.find(p => p.id === id)
            cb(product)
        })
    }
}