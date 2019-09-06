const express = require('express')
const router = express.Router()
//const Sequelize = require('sequelize')
// const bcrypt = require('bcryptjs');
// const auth = require('basic-auth');


//body-parsar middleware
const bodyParser = require('body-parser');
router.use(bodyParser.json());

router.set('models', require('../models'));

//Send a GET request to /api/user route, which displays a user.
router.get('/api/routes', (req, res, next) => {
    res.status(200)
    res.json('{}');
});

router.post('/api/user', (req,res) => {
    //requests the user
    const user = req.body
    //Adds the user to the users array
    user.push(user)
    //sets status to 201
    res.status(201).end()
})


//setup a friendly greeting for the root route

router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

//send 404 if no other route matched
router.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});