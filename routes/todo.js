var express = require('express'),
router = express.Router(),
mongoose = require('mongoose'), //mongo connection
bodyParser = require('body-parser'), //parses information from POST
methodOverride = require('method-override'); //used to manipulate POST
Todo = mongoose.model('Todo')


//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}))

//build the REST operations at the base for todos
//this will be accessible from http://127.0.0.1:3000/todos if the default route for / is left unchanged
router.route('/')
//GET all todos
.get(function(req, res, next) {
    //retrieve all todos from Monogo
    Todo.find({}, function (err, todos) {
          if (err) {
              return console.error(err);
          } else {
              res.format({
                html: function(){
                    res.render('todos/index', {
                          title: 'All my Todos',
                          "todos" : todos
                      });
                },
                json: function(){
                    res.json(todos);
                }
            });
          }     
    });
})
//POST a new todo
.post(function(req, res) {
    var content = req.body.content;
    var completed = req.body.completed;
    var updated_at = req.body.updated_at;

    //call the create function for our database
    Todo.create({
        content : content,
        completed : completed,
        updated_at : updated_at,
    }, function (err, todo) {
          if (err) {
              res.send("There was a problem adding the information to the database.");
          } else {
              console.log('POST creating new todo: ' + todo);
              res.format({
                html: function(){
                    res.location("todos");
                    res.redirect("/todos");
                },
                json: function(){
                    res.json(todo);
                }
            });
          }
    })
});

/* GET New Todo page. */
router.get('/create', function(req, res) {
res.render('todos/create', { title: 'Create New Todo' });
});

router.param('id', function(req, res, next, id) {
//find the ID in the Database
Todo.findById(id, function (err, todo) {
    if (err) {
        console.log(id + ' was not found');
        res.status(404)
        var err = new Error('Not Found');
        err.status = 404;
        res.format({
            html: function(){
                next(err);
             },
            json: function(){
                   res.json({message : err.status  + ' ' + err});
             }
        });
    } else {
        req.id = id;
        next(); 
    } 
});
});

router.route('/:id')
.get(function(req, res) {
Todo.findById(req.id, function (err, todo) {
  if (err) {
    console.log('GET Error: There was a problem retrieving: ' + err);
  } else {
    console.log('GET Retrieving ID: ' + todo._id);
    res.format({
      html: function(){
          res.render('todos/show', {
           todo:todo
          });
      },
      json: function(){
          res.json(todo);
      }
    });
  }
});
});

router.route('/:id/edit')
//GET the individual todo by Mongo ID
.get(function(req, res) {
    Todo.findById(req.id, function (err, todo) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            console.log('GET Retrieving ID: ' + todo._id);
            console.log('GET Retrieving ID: ' + todo);
            res.format({
                html: function(){
                       res.render('todos/edit', {
                          todo:todo
                      });
                 },
                 //JSON response will return the JSON output
                json: function(){
                       res.json(todo);
                 }
            });
        }
    });
})
//PUT to update a todo by ID
.put(function(req, res) {
    var content = req.body.content;
    var completed = req.body.completed;
    var updated_at = req.body.updated_at;

    Todo.findById(req.id, function (err, todo) {
        todo.update({
            content : content,
            completed : completed,
            updated_at : updated_at,
            
        }, function (err, todoID) {
          if (err) {
              res.send("There was a problem updating the information to the database: " + err);
          } 
          else {
                  res.format({
                      html: function(){
                           res.redirect("/todos/" + todo._id);
                     },
                    json: function(){
                           res.json(todo);
                     }
                  });
           }
        })
    });
})
//DELETE a Todo by ID
.delete(function (req, res){
    Todo.findById(req.id, function (err, todo) {
        if (err) {
            return console.error(err);
        } else {
            todo.remove(function (err, todo) {
                if (err) {
                    return console.error(err);
                } else {
                    console.log('DELETE removing ID: ' + todo._id);
                    res.format({
                          html: function(){
                               res.redirect("/todos");
                         },
                        json: function(){
                               res.json({message : 'deleted',
                                   item : todo
                               });
                         }
                      });
                }
            });
        }
    });
});

module.exports = router;