const Sequelize = require('sequelize').Sequelize

const sequelize = new Sequelize(
    'nodejs-learning',
    'root',
    'Devil9x12345678', 
    {
        dialect: 'mssql',
        host: 'localhost'
    }
)

module.exports = sequelize