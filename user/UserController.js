const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const LocalStorage = require('node-localstorage').LocalStorage;
const config = require('../config.js');
const jwt = require('jsonwebtoken');
const localStorage = new LocalStorage('./scratch');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const User = require('../models/User_model');
//const Orderlist = require('../models/Order_model')

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static(__dirname+'/public'));


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

 router.get('/logout', (req,res) => {
     localStorage.removeItem('authtoken');
     res.redirect('/');
 })

module.exports = router;