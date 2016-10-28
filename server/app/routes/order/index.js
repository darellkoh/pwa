var orders = require('express').Router(); // eslint-disable-line new-cap
module.exports = orders;

var Order = require('../../../db/models/order.js');
var OrderItem = require('../../../db/models/orderItem.js');
var Product = require('../../../db/models/products.js');
var Promise = require('bluebird');

///////////////////////////////////////////
//  Route: api/orders
///////////////////////////////////////////


// Returns all orders if you just ping the /orders route
orders.get('/', function(req, res, next) {
    Order.findAll()
        .then(function(allOrders) {

            if (allOrders.length === 0) {
                var err = new Error('Order does not exist.');
                err.status = 404;
                throw err;
            } else {
                res.status(200).send(allOrders);
            }
        })
        .catch(next);
});

//POST - create new order
orders.post('/', function(req, res, next) {
    if (req.query.sessionSave) {
        req.session.cart = req.body
        res.status(201).send(req.body);
    } else {
        Order.create({ complete: true })
            .then(function(orderCreated) {
                return orderCreated.setUser(req.user.id);
            })
            .then(function(order) {
                var creatingOrders = [];
                console.log('order req body', req.body);
                req.body.forEach(function(orderItem) {
                    creatingOrders.push(OrderItem.create({
                        qtyPurchased: orderItem.qty,
                        productCost: orderItem.price,
                        productId: orderItem.id,
                        userId: req.user.id,
                        orderId: order.id
                    }));
                })
                return Promise.all(creatingOrders);
            })
            .then(function(createdOrders) {
              req.session.cart = null;
                res.status(201).send(createdOrders);
            })
            .catch(next);
    }
});

//Order Params
orders.param('orderId', function(req, res, next, id) {
    Order.findById(id, {
            include: [{
                model: OrderItem,
                include: [Product]
            }]
        })
        .then(function(order) {
            if (!order) {
                var err = new Error('Order does not exist.');
                err.status = 404;
                throw err;
            }
            req.order = order;
            next();
        })
        .catch(next);
});

orders.post('/:orderId/orderItems', function(req, res, next) {
    OrderItem.create(req.body)
        .then(function(orderItem) {
            orderItem.setOrder(req.order.id);
            orderItem.setProduct(req.body.productId);
            res.status(201).send(orderItem);
        })
        .catch(next);
});


// GET all OrderItems
orders.get('/:orderId/orderItems', function(req, res, next) {
    OrderItem.findOne({
            where: {
                id: req.params.orderId
            },
            include: [Product, Order]
        })
        .then(function(foundOrderItems) {
            res.status(200).send(foundOrderItems);
        })
        .catch(next);
});


// GET one order
orders.get('/:orderId', function(req, res, next) {
    res.send(req.order);
});

//PUT One (update)
orders.put('/:orderId', function(req, res, next) {
    req.order.update(req.body)
        .then(function(order) {
            res.status(200).send(order);
        })
        .catch(next);
});

//DELETE
orders.delete('/:orderId/orderItems/:orderItemsId', function(req, res, next) {
    var orderItem = req.params.orderItemsId;
    OrderItem.destroy({
            where: {
                id: orderItem
            }
        })
        .then(function() {
            res.sendStatus(204);
        })
        .catch(next);
});


//PUT Updates one order item
orders.put('/:orderId/orderItems/:orderItemsId', function(req, res, next) {
    var orderItem = req.params.orderItemsId;
    OrderItem.findById(orderItem)
        .then(function(item) {
            return item.update(req.body)
        })
        .then(function(updatedItem) {
            res.status(200).send(updatedItem);
        })
        .catch(next);
})



//GET one order item
orders.get('/:orderId/orderItems/:orderItemsId', function(req, res, next) {
    var orderItem = req.params.orderItemsId;
    OrderItem.findById(orderItem)
        .then(function(item) {
            res.send(item);
        })
        .catch(next);
})
