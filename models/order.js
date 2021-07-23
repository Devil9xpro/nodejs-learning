const {
    DataTypes
} = require('sequelize')
const sequelize = require('../util/database')
const Order = sequelize.define('order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: true,
        primaryKey: true
    }
})

module.exports = Order