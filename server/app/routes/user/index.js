var express = require('express');
var router = express.Router();
var User = require('../../../db/models/user');

module.exports = router;

// Get all
router.get('/', function(req, res, next) {
    User.findAll({})
        .then(function(users) {
            res.send(users);
        })
        .catch(next);
});

// POST one
router.post('/', function(req, res, next) {
    User.create(req.body)
        .then(function(user) {
            res.status(201)
            res.send(user.sanitize())
        })
        .catch(next);
});


router.param('userId', function(req, res, next, id) {
    User.findById(id)
        .then(function(user) {
            if (!user) {
                var err = Error('User not found');
                err.status = 404;
                throw err
            }
            req.user = user;
            next();
            return null;
        })
        .catch(next);
});

// GET one
router.get('/:userId', function(req, res) {
    res.send(req.user);
});

// PUT - update
router.put('/:userId', function(req, res, next) {
    req.review.update(req.body)
        .then(function(updatedUser) {
            res.status(200).send(updatedUser);
        })
        .catch(next);
});

// DELETE
router.delete('/:userId', function(req, res, next) {
    req.review.destroy()
        .then(function() {
            res.status(204).end();
        })
        .catch(next);
});
