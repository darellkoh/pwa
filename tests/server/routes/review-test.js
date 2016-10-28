var expect = require('chai').expect;

var Sequelize = require('sequelize');

var db = require('../../../server/db');

var supertest = require('supertest');

describe('Review Route', function() {

    var app, Review;

    beforeEach('Sync DB', function() {
        return db.sync({ force: true });
    });

    beforeEach('Create app', function() {
        app = require('../../../server/app')(db);
        Review = db.model('review');
    });

    var reviewInfo = {
        id: 1,
        title: "Review",
        rating: 1,
        content: "great"
    }

    var reviewInfo2 = {
        id: 5,
        title: "Review2",
        rating: 4,
        content: "fantastic!"
    }

    beforeEach('Create a review', function(done) {
        return Review.create(reviewInfo).then(function(review) {
            done();
        }).catch(done);
    });

    describe('it got a review', function() {

        var reviewAgent;

        beforeEach('Create review agent', function() {
            reviewAgent = supertest.agent(app);
        });

        it('should get a 200 response from a get all review and the first review have an id of 1', function(done) {
            reviewAgent.get('/api/reviews/')
                .expect(200)
                .end(function(err, response) {
                    if (err) return done(err);
                    expect(response.body).to.be.an('array');
                    expect(response.body[0].id).to.eql(reviewInfo.id);
                    expect(response.body.length).to.eql(1);
                    done();
                });
        });

        it('should get a 200 response and find a review with an id of 1', function(done) {
            reviewAgent.get('/api/reviews/1')
                .expect(200)
                .end(function(err, response) {
                    if (err) return done(err);
                    expect(response.body).to.be.an('object');
                    expect(response.body.id).to.eql(reviewInfo.id);
                    done();
                });
        });

        it('should succesfully create a new review and get a 201 status response', function(done) {
            reviewAgent.post('/api/reviews/')
                .send(reviewInfo2)
                .expect(201)
                .end(function(err, response) {
                    if (err) return done(err);
                    expect(response.body).to.be.an('object');
                    expect(response.body.id).to.eql(reviewInfo2.id);
                    expect(response.body.description).to.eql(reviewInfo2.description);
                    done();
                });
        });



    });
});
