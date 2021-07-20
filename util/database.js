const Sequelize = require('sequelize').Sequelize

const sequelize = new Sequelize(
    'nodejs-learning',
    'root',
    'Devil9x12345678', 
    {
        dialect: 'mysql',
        host: 'localhost'
    }
)

module.exports = sequelize