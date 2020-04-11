const express = require('express');
const router = express.Router();
const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./scratch');
const config = require('../config.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const User = require('../models/User_model');
const Orderlist = require('../models/Order_model')

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static(__dirname+'/public'));

const session = require('express-session');
router.use(session({secret: 'myPassword1', resave: false, saveUninitialized: true}));



router.post('/addUser', (req, res) => {

    const token = localStorage.getItem('authtoken')
    if (!token) {
        res.redirect('/')
    }
    jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
        res.redirect('/')
    };
        User.findById(decoded.id, { password: 0 }, (err, user) => {
            if (err) {res.redirect('/')}
            if (!user) {res.redirect('/')}

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
                        if(err) return res.status(400).send('User Registration Failed')
                        htmlMsg = encodeURIComponent('New User Registration is Completed!');
                        res.redirect('/admin/userDashboard?msg=' + htmlMsg)
                    })
                }else{ 
                    htmlMsg = encodeURIComponent('Email exists: please use a new email.');
                    res.redirect('/admin/userDashboard?msg=' + htmlMsg);
                }
            }) 
        });
    });
});



router.get('/userDashboard', (req, res) => {
    const token = localStorage.getItem('authtoken')
    if (!token) {
        res.redirect('/')
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        
        if (err) res.redirect('/')
        User.findById(decoded.id, { password: 0 }, (err, user) => {
            if (err) {res.redirect('/')}
            if (!user) {res.redirect('/')}

            User.find({}, (err,data)=>{
                if(err) res.status(400).send(err)
                else{
                    res.render('userDashboard.ejs', {
                        user,
                        data,
                        msg: req.query.msg?req.query.msg:''
                    })
                }
            })
        });
    });
});

module.exports = router