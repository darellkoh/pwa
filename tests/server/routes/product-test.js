var expect = require('chai').expect;

var Sequelize = require('sequelize');

var db = require('../../../server/db');

var supertest = require('supertest');

describe('Product Route', function() {

    var app, Product;

    beforeEach('Sync DB', function() {
        return db.sync({ force: true });
    });

    beforeEach('Create app', function() {
        app = require('../../../server/app')(db);
        Product = db.model('product');
    });

    var productInfo = {
        id: 1,
        name: 'ToothBrush',
        description: 'A really nice toothbrush.',
        price: 500,
        qtyInStock: 5

    }
    var productInfo2 = {
        id: 5,
        name: 'milad',
        description: 'A really nice toothbrush.',
        price: 500,
        qtyInStock: 5
    }

    beforeEach('Create a Product', function(done) {
        return Product.create(productInfo).then(function(product) {
            done();
        }).catch(done);
    });

    describe('Product route responds with created product.', function() {

        var productAgent;

        beforeEach('Create product agent', function() {
            productAgent = supertest.agent(app);
        });

        it('should get a 200 response from the products route and the first product should have an id of 1', function(done) {
            productAgent.get('/api/products/')
                .expect(200)
                .end(function(err, response) {
                    if (err) return done(err);
                    expect(response.body).to.be.an('array');
                    expect(response.body[0].id).to.eql(productInfo.id);
                    expect(response.body.length).to.eql(1);
                    done();
                });
        });

        it('should get a 200 response from the products/1 route and the product should find a product with an ID of 1', function(done) {
            productAgent.get('/api/products/1')
                .expect(200)
                .end(function(err, response) {
                    if (err) return done(err);
                    expect(response.body).to.be.an('object');
                    expect(response.body.id).to.eql(productInfo.id);
                    expect(response.body.name).to.eql(productInfo.name);
                    done();
                });
        });


        it('should successfully create a new product and get a 201 status response', function(done) {
            productAgent.post('/api/products/')
                .send(productInfo2)
                .expect(201)
                .end(function(err, response) {
                    if (err) return done(err);
                    expect(response.body).to.be.an('object');
                    expect(response.body.id).to.eql(productInfo2.id);
                    expect(response.body.description).to.eql(productInfo2.description);
                    done();
                });
        });


    });


    // PUT

    // DELETE
});
