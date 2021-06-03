//jshint esversion:6
const lodash = require('lodash');
const express = require("express");
const ejs = require("ejs");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();
let newPost = [];
let signIn = "Please enter your password";
let authenticated = false;
app.set('view engine', 'ejs');

app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));


app.get('/', (req, res) => {
  res.render('home', {
    homeContent: homeStartingContent,
    post: newPost,
    passwordCorrect: authenticated
  });
})

app.get('/posts/:postId', (req, res) => {
  let match = false;
  let searchFor = lodash.lowerCase(req.params.postId);
  console.log(searchFor);
  newPost.forEach((index) => {
    let indexTitle = lodash.lowerCase(index.title);
    if (indexTitle.includes(searchFor)) {
      let position = newPost.indexOf(index);
      match = true;
      res.render('post', {
        post: newPost[position]
      });
    } 
  })
  if (!match){
    res.send("<h1>404 Error</h1><p>Page does not exist</p>");
  }
})

app.get('/about', (req, res) => {
  res.render('about', {
    content: aboutContent
  });
})

app.get('/contact', (req, res) => {
  res.render('contact', {
    content: contactContent
  });
})

app.get('/compose', (req, res) => {
  res.render('compose', {
    passwordCorrect: authenticated
  });
})

app.get('/composeBtn', (req, res) => {
  res.redirect('/compose')
})

app.get('/signin', (req, res) => {
  res.render('signin', {
    signInMessage: signIn
  });
})

app.post('/compose', (req, res) => {
  let submissionTitle = req.body.postTitle;
  let submissionPost = req.body.postBody;
  newPost.push({
    title: submissionTitle,
    post: submissionPost
  });
  console.log(newPost);
  res.redirect('/');
})

app.post('/signin', (req, res) => {
  if (req.body.password === process.env.password) {
    authenticated = true;
    res.redirect('/');
  } else {
    signIn = "Incorrect password, please try again";
    res.redirect('/signin');
  }
})

app.listen(process.env.PORT, function () {
  console.log("Server started on port 3000");
});