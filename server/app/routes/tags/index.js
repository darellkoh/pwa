var router = require('express').Router(); // eslint-disable-line new-cap
var db = require('../../../db/index.js');
var Tags = db.model('tags');
module.exports = router;


// GET all
router.get('/', function( req, res, next){
  Tags.findAll({})
  .then(function(tags){
    res.status(200).send(tags);
  })
  .catch(next);

})

// POST one
router.post('/', function(req, res, next){
  Tags.create(req.body)
  .then(function(createdTags){
    res.status(201).send(createdTags);
  })
  .catch(next);
});


// Tags Params
router.param('tagsId', function(req, res, next, id){
  Tags.findById(id)
  .then(function(category){
    if(!tags){
      var err = Error('Tags not found.');
      err.status = 404;
      throw err;
    }
    req.tags = tags;
    next();
  })
  .catch(next);
});


//GET one
router.get('/:tagsId', function( req, res, next){
  res.send(req.tags);
});

// PUT - update one
router.put('/:tagsId', function(req, res, next){
  req.tags.update(req.body)
  .then(function(updatedTags){
    res.status(200).send(updatedTags);
  })
  .catch(next);
});

// DELETE a Tag
router.delete('/:tagsId', function(req, res, next){
  req.tags.destroy()
  .then(function(){
    res.status(204).end();
  })
  .catch(next);
});
