'use strict';
var Sequelize = require('sequelize');

var db = require('../_db');

module.exports = db.define('product', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    price: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    qtyInStock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    photo: {
        type: Sequelize.STRING(10000),
        defaultValue: 'http://image.spreadshirtmedia.com/image-server/v1/compositions/19354318/views/1,width=280,height=280,appearanceId=2,version=1440417743.png/lightning-cat_design.png',
    }
});
