const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop-controller')
const router = express.Router();

router.get('/', shopController.getIndex)
router.get('/products', shopController.getProducts)
//alway put dynamic route at the end of the same path
//vd : /products/:delete sau /products/:productId thi k bao h call vao dc delete
router.get('/products/:productId',shopController.getProduct)
router.get('/cart', shopController.getCart)
router.get('/orders', shopController.getOrders)
router.get('/checkout', shopController.getCheckOut)


module.exports = router;