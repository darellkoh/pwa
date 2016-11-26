'use strict';
var router = require('express').Router(); // eslint-disable-line new-cap
module.exports = router;

router.use('/members', require('./members'));
router.use('/orders', require('./order'));
router.use('/products', require('./product'));
router.use('/reviews', require('./review'));
router.use('/users', require('./user'));
router.use('/category', require('./category'));
router.use('/tags', require('./tags'));


router.use(function (req, res) {
    res.status(404).end();
});
