/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

*/

var chalk = require('chalk');
var db = require('./server/db');
var User = db.model('user');
var Product = db.model('product');
var Category = db.model('category');
var Tags = db.model('tags');

var Review = db.model('review');
var OrderItem = db.model('orderItem');
var Order = db.model('order');
var Promise = require('sequelize').Promise;

var categoryServices = require('./seedUtils/category');
var productServices = require('./seedUtils/products');

var seedUsers = function () {

    var users = [
        {
            email: 'test@gmail.com',
            isAdmin: false,
            password: 'password'
        },
        {
            email: 'obama@gmail.com',
            isAdmin: true,
            password: 'potus'
        }
    ];

    var creatingUsers = users.map(function (userObj) {
        return User.create(userObj);
    });

    return Promise.all(creatingUsers);

};

var seedCategories = function () {

    var creatingCategories = categoryServices.CATEGORIES.map( function(categoryName){
        return Category.create({ name: categoryName });
    });

    return Promise.all(creatingCategories);
}
var seedTags = function () {
    var tags = [
        {
            name: "funny"
        },
        {
            name: "google"
        },
        {
            name: "horrible"
        },
        {
            name: "Milad"
        },
    ];

    var creatingTags = tags.map( function(tagObj){
        return Tags.create(tagObj);
    });

    return Promise.all(creatingTags);
}

var seedProducts = function () {

    var creatingProducts = productServices.PRODUCTS().map(function (projectObj) {


        return Product.create(projectObj);
    });

    return Promise.all(creatingProducts);
};

var seedOrders = function() {
    var orders = [
        { complete: false },
        { complete: true  },
        { complete: false },
        { complete: true  },
    ];

    var creatingOrders = orders.map(function(orderObj){
        return Order.create(orderObj)
        .then(function(order){
            return order.setUser(1);
        })
        .then(function(order){
            return order;
        })
        .catch(console.error)
    })

    return Promise.all(creatingOrders);
}

var seedReviews = function() {
    var reviews = [
        {
            title: "milad",
            userId: "2",
            productId: "1",
            content: "GREAT",
            rating: "5"
        }
    ]
    var creatingReviews = reviews.map(function (reviewObj) {
            return Review.create(reviewObj);
        });

        return Promise.all(creatingReviews);
}

db.sync({force:true})
    .then(function () {
        return seedUsers();
    })
    .then(function () {
        console.log(chalk.green('Seed users successful!'));
        //process.exit(0);
    })
    .then(function () {
        return seedCategories();
    })
    .then(function () {
        console.log(chalk.green('Seed Categories successful!'));
        //process.exit(0);
    })
    .then(function () {
        return seedTags();
    })
    .then(function () {
        console.log(chalk.green('Seed Tags successful!'));
        //process.exit(0);
    })
    .then(function(){
        return seedProducts();
    })
    .then(function(){
        return seedOrders();
    })
    .then(function(){
        return seedReviews();
    })
    .then(function () {
        console.log(chalk.green('Seed products successful!'));
        process.exit(0);
    })
    .catch(function (err) {
        console.error(err);
        process.exit(1);
    });
