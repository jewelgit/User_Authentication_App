const express = require('express');
const router = express.Router();
const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./scratch');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const User = require('../models/User_model');
const session = require('express-session');

router.use(session({secret: 'myPassword1', resave: false, saveUninitialized: true}));
app.use(express.static(__dirname+'/public'));
app.set('view engine', 'ejs');
app.set('views', './views');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/registerAdmin', (req,res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(400).send('Error on the server.');
    let htmlMsg
    if(!user){ 
      const hashedPasword = bcrypt.hashSync(req.body.password, 8);
      User.create({
          name: req.body.name,
          email: req.body.email,
          password: hashedPasword,
          role: req.body.role
      }, (err, user) => {
          if(err) return res.status(400).send('Registration Failes')
          htmlMsg = encodeURIComponent('The User is successfully registed. ');
          res.redirect('/?msg=' + htmlMsg)
      })
    }else{ 
      htmlMsg = encodeURIComponent('Email exists: please use another email.');
      res.redirect('/admin?msg=' + htmlMsg);
    }
  }) 
  
})


router.post('/register', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) return res.status(400).send('Error on the server.');
      let htmlMsg
      if(!user){ 
        const hashedPasword = bcrypt.hashSync(req.body.password, 8);
        User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPasword,
            role: "normal"
        }, (err, user) => {
            if(err) return res.status(400).send('There was a problem registering')
            htmlMsg = encodeURIComponent('Registered OK !');
            res.redirect('/?msg=' + htmlMsg)
        })
      }else{ 
        htmlMsg = encodeURIComponent('Email existing, please enter another email');
        res.redirect('/?msg=' + htmlMsg);
      }
    }) 
});

router.post('/login', (req, res) => {

    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) return res.status(400).send('Error on the server.');
      let htmlMsg
      if (!user) { 
        htmlMsg = encodeURIComponent('Email not found, try again ...');
        res.redirect('/?invalid=' + htmlMsg);
      }else{
        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) {
          return res.status(401).send({ auth: false, token: null });
        }

        var token = jwt.sign({ id: user._id }, config.secret, {
            expiresIn: 86400 
        });
        localStorage.setItem('authtoken', token)

        if(user.role == 'admin'){
          res.redirect(`/admin/userDashboard`)
        }else{
          res.redirect(`/users/userDashboard`); //if you want to redirect to News.js , change here
        }
      }
    });
});

router.get('/loginedUser', function(req, res) {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) return res.status(400).send({ auth: false, message: 'Failed to authenticate token.' });
 
      User.findById(decoded.id, { password: 0 }, function (err, user) {
        if (err) return res.status(400).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        
        res.status(200).send(user);
      });
    });
  });



  module.exports = router