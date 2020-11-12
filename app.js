const bodyParser = require("body-parser"),
methodOverride   = require("method-override"),
expressSanitizer = require("express-sanitizer"),
mongoose         = require("mongoose"),
express          = require("express"),
app              = express();

mongoose.connect('mongodb://localhost:27017/blog_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));
mongoose.set('useFindAndModify', false);

//APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

app.get("/", (req, res)=>{
    res.redirect("/blogs");
});

//INDEX ROUTE
app.get("/blogs", (req, res)=>{
    Blog.find({}, (err, blogs)=>{
        if(err){
            console.log("ERROR!");
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

//NEW ROUTE 
app.get("/blogs/new", (req, res)=>{
    res.render("new");
});

//CREATE ROUTE
app.post("/blogs", (req, res)=>{
    //create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (err, newBlog)=>{
        if(err){
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    });
});

//SHOW ROUTE
app.get("/blogs/:id", (req, res)=>{
       Blog.findById(req.params.id, (err, foundBlog)=>{
           if(err){
               res.redirect("/blogs");
           } else {
               res.render("show", {blog: foundBlog});
           }
       });
});

//EDIT ROUTE
app.get("/blogs/:id/edit", (req, res)=>{
    Blog.findById(req.params.id, (err, foundBlog)=>{
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id", (req, res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog)=>{
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/"+req.params.id);
        }
});
});

//DELETE ROUTE
app.delete("/blogs/:id", (req, res)=>{
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
    //redirect somewhere
});

app.listen(3000, ()=>{
    console.log("Server has started!");
});