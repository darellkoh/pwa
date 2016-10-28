//order as a group

var Sequelize = require('sequelize');
var db = require('../_db');

//ASSOCIATIONS: user_id

module.exports = db.define('order', {

  date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },

  complete: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  }
})
