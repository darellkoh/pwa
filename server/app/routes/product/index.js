var router = require('express').Router(); // eslint-disable-line new-cap
var db = require('../../../db/index.js');
var Product = db.model('product');
var Category = db.model('category');
module.exports = router;


// GET all
router.get('/', function( req, res, next){
  Product.findAll({ include: [Category]
  })
  .then(function(products){
    res.status(200).send(products);
  })
  .catch(next);

})

// POST one
router.post('/', function(req, res, next){

  Product.create(req.body)
  .then(function(createdProduct){
    res.status(201).send(createdProduct);
  })
  .catch(next);
});


// Product Params
router.param('productId', function(req, res, next, id){
  Product.findById(id)
  .then(function(product){
    if(!product){
      var err = Error('Product not found.');
      err.status = 404;
      throw err;
    }
    req.product = product;
    next();
    return null;
  })
  .catch(next);
});


//GET one
router.get('/:productId', function( req, res, next){
  res.send(req.product);
});

// PUT - update one
router.put('/:productId', function(req, res, next){
  console.log('req product', req.product);
  console.log('req body', req.body);
  req.product.update(req.body)
  .then(function(updatedProduct){
    console.log('updatedproduct', updatedProduct);
    res.status(200).send(updatedProduct);
  })
  .catch(next);
});

// DELETE a product
router.delete('/:productId', function(req, res, next){
  req.product.destroy()
  .then(function(){
    res.status(204).end();
  })
  .catch(next);
});
