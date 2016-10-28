var Sequelize = require('sequelize');
var db = require('../_db');

//SINGLE ORDER LINE-ITEMS IN OUR ORDER GROUP

module.exports = db.define('orderItem', {

 // Associations
 // user_id, product_id, order_id (meaning the full order here)

  qtyPurchased: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
     min: 1
    }
  },

  productCost: {
    type: Sequelize.INTEGER,
    allowNull: false,
  }

});

// TODOS
// Add a hook in sometime down the road to make sure we have qtyPurchased in stock
// and if so subtract from our qty in stock in the product model

/* coming back to modelOptions later */

// var modelOptions = {};

//   modelOptions.classMethods = {};
//   modelOptions.classMethods.getOrder = function(idOfOrder){
//       return this.findAll({
//         where: {
//           order_id: idOfOrder
//         }
//       })
//     }

//   modelOptions.classMethods.getOrderTotal = function(idOfOrder){
//       return this.getOrder(idOfOrder)
//               .then(function(arrayOfOrders){
//               var sumTotal = 0;
//                 arrayOfOrders.forEach(function(order){
//                   sumTotal += order.product_cost;
//                 })
//                 return sumTotal;
//               })
//     }
