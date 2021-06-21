//jshint esversion:6
const lodash = require('lodash');
const express = require("express");
const session = require('express-session');
const ejs = require("ejs");
const app = express();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const {
  Schema
} = mongoose;

const aboutContent = "Hey, I'm Ryan May, web developer and this is a blog site I created in order to test my knowledge of both front end and backend tech.";
let DBpassword = process.env.dbpassword;




app.set('view engine', 'ejs');
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.use(session({
  secret: process.env.Secret,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(`mongodb+srv://Admin:${DBpassword}@webdevblog.l4je9.mongodb.net/BlogDB`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const postSchema = new mongoose.Schema({
  name: String,
  post: String,
  user: String
});

const blogPost = mongoose.model('blogPost', postSchema);

const userSchema = new Schema({
  username: String,
  password: String,
});


const User = mongoose.model('user', userSchema);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function (username, password, done) {
    User.findOne({
      username: username
    }, (err, user) => {
      if (err) {
        return done(err);
      } else if (!user) {
        return done(null, false);
      } else {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return done(err)
          }
          if (!result) {
            return done(null, false)
          } else {
            return done(null, user);
          }
        })
      }

    })
  }
));

app.get('/', (req, res) => {
  res.render('welcome');
});

app.get('/home', (req, res) => {
  if (req.isAuthenticated()) {
    blogPost.find((err, posts) => {
      res.render('home', {
        posts: posts
      });
    })
  } else {
    res.redirect('/signin');
  }
})

app.get('/posts/:postId', (req, res) => {
  let searchFor = lodash.capitalize(req.params.postId);
  console.log(`post searched for was" ${searchFor}`);
  let body;

  blogPost.findOne({
    name: searchFor
  }, (err, item) => {
    if (!err) {
      if (item) {
        body = item.post;
        res.render('post', {
          postTitle: searchFor,
          postBody: body
        });
      } else {
        res.send("<h1>404 Error</h1><p>Page does not exist</p>");
      }
    }
  });

})

app.get('/about', (req, res) => {
  res.render('about', {
    content: aboutContent
  });
})

app.get('/compose', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('compose');
  } else {
    res.redirect('/signin');
  }
})

app.get('/composeBtn', (req, res) => {
  res.redirect('/compose')
})

app.get('/logout',(req,res)=>{
  req.logout();
  res.redirect('/');
})

app.get('/signin', (req, res) => {
  res.render('signin');
})

app.get('/register', (req, res) => {
  res.render('register')
});



app.post('/compose', (req, res) => {
  const newPost = new blogPost({
    name: lodash.capitalize(req.body.postTitle),
    post: req.body.postBody,
    user: req.user.username
  });
  newPost.save();
  res.redirect('/home');
})

app.post('/register', (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    if (!err) {
      newUser = new User({
        username: req.body.username,
        password: hash
      })

      newUser.save((err) => {
        if (!err) {
          console.log("New user created successfully");
          passport.authenticate("local")(req, res, () => {
            res.redirect('/home');
          });
        } else {
          console.log(`Error occured while registering users: ${err}`);
          res.redirect('/register');
        }
      })
    }
  })
});

app.post('/signin',
  passport.authenticate("local", {
    failureRedirect: '/signin'
  }), (req, res) => {
    console.log(req.user.username);
    res.redirect('/home');
  }
);


app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});