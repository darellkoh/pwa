var router = require('express').Router(); // eslint-disable-line new-cap
var db = require('../../../db/index.js');
var Category = db.model('category');
module.exports = router;


// GET all
router.get('/', function( req, res, next){
  Category.findAll({})
  .then(function(categories){
    res.status(200).send(categories);
  })
  .catch(next);

})

// POST one
router.post('/', function(req, res, next){
  Category.create(req.body)
  .then(function(createdCategory){
    res.status(201).send(createdCategory);
  })
  .catch(next);
});


// Product Params
router.param('categoryId', function(req, res, next, id){
  Category.findById(id)
  .then(function(category){
    if(!category){
      var err = Error('Category not found.');
      err.status = 404;
      throw err;
    }
    req.category = category;
    next();
  })
  .catch(next);
});


//GET one
router.get('/:categoryId', function( req, res, next){
  res.send(req.category);
});

// PUT - update one
router.put('/:categoryId', function(req, res, next){
  req.category.update(req.body)
  .then(function(updatedCategory){
    res.status(200).send(updatedCategory);
  })
  .catch(next);
});

// DELETE a category
router.delete('/:categoryId', function(req, res, next){
  req.category.destroy()
  .then(function(){
    res.status(204).end();
  })
  .catch(next);
});
