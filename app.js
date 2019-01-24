var express = require('express'),
mongoose = require('mongoose'),
expressSanitizer = require('express-sanitizer'),
bodyParser = require('body-parser'),
methodOverride = require('method-override'),
app = express();

//connect to mongoose
mongoose.connect("mongodb://localhost/here", { useNewUrlParser: true }); // enter name of db after localhost/

//app setup
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method")); 
app.use(expressSanitizer()); // Sanitizes input to make sure nobody runs scripts on your server


//Schema
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);


// RESTful Routes
app.get("/", function(req, res) {
   res.redirect("/blogs"); 
});

// SHOW ALL
app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, blogs) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

// NEW 
app.get("/blogs/new", function(req, res) {
    res.render("new");
})

// CREATE
app.post('/blogs', function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog) {
        if (err) {
            res.render("new");
        } else {
            res.redirect('/blogs');
        }
    });
});

//SHOW
app.get('/blogs/:id', function(req,res) {
    Blog.findById(req.params.id, function(err, blogFound) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: blogFound});
        }
    });
});

//EDIT
app.get('/blogs/:id/edit', function(req, res) {
    Blog.findById(req.params.id, function(err, blogFound) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render('edit', {blog: blogFound}); 
        }
    });
});

//UPDATE
app.put('/blogs/:id', function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findOneAndUpdate(req.params.id, req.body.blog, function(err, blogUpdated) {
       if (err) {
           res.redirect("/blogs");
       } else {
           res.redirect("/blogs/" + req.params.id);
       }
   })
});

//DELETE
app.delete('/blogs/:id', function(req, res) {
    Blog.findOneAndRemove(req.params.id, req.body.blog, function(err) {
        if (err) {
            res.redirect("blogs");
        } else {
            res.redirect("blogs");
        }
    })
})

// HOSTS
app.listen(process.env.PORT, process.env.IP, function() {
    console.log('Server is running');
});