const app = require('./app');
const express = require('express');

const port = process.env.PORT || 3300;

const bodyParser =  require('body-parser');
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

const session = require('express-session');
app.use(session({
  secret: 'myPassword',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(__dirname+'/public'));
app.set('view engine', 'ejs');
app.set('views', './views');

let sess;

app.get('/admin',(req,res) => {
  sess=req.session;
  sess.email=" "
  res.render('adminSignUp',
    { invalid: req.query.invalid?req.query.invalid:'',
      msg: req.query.msg?req.query.msg:''})
})

app.get('/',(req,res) => {
    sess=req.session;
    sess.email=" "
    res.render('signin',
      { invalid: req.query.invalid?req.query.invalid:'',
        msg: req.query.msg?req.query.msg:''})
    
})

const server = app.listen(port, () => {
  console.log('Express server listening on port 3300');
  console.log('Please go to localhost:3300/admin to register as an admin')
  console.log('Please go to localhost:3300 to enter your login credentials')
});