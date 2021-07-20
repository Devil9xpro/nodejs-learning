const mysql = require('mysql2')

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'nodejs-learning',
    password: 'Devil9x12345678'
})

module.exports = pool.promise();