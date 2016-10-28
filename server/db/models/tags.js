var Sequelize = require('sequelize');
var db = require('../_db');

module.exports = db.define('tags', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

