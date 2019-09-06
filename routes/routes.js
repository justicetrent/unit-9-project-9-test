// Constructing a router instance.
const express = require('express');
const router = express.Router();
// const data = require('../seed/data.json')
const User = require('../models').User;
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth')
// const bodyParser = require('body-parser');
// router.use(bodyParser.json())
// router.use(bodyParser.urlencoded({ extended: false }))

//User authentication middleware
const authenticateUser = async (req, res, next) => {
  let message;
  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);
  if (credentials) {
    //Find user with matching email address
    const user = await User.findOne({
      raw: true,
      where: {
        emailAddress: credentials.name,
      },
    });
    //If user matches email
    if (user) {
      // Use the bcryptjs npm package to compare the user's password
      // (from the Authorization header) to the user's password
      // that was retrieved from the data store.
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
      //If password matches
      if (authenticated) {
        console.log(`Authentication successful for user: ${user.firstName} ${user.lastName}`);
        if (req.originalUrl.includes('courses')) {
          //If route has a courses endpoint, set request userId to matched user id
          req.body.userId = user.id;
        } else if (req.originalUrl.includes('users')) {
          //If route has a users endpoint, set request id to matched user id
          req.body.id = user.id;
        }
      } else {
        //Otherwise the Authentication failed
        message = `Authentication failed for user: ${user.firstName} ${user.lastName}`;
      }
    } else {
      // No email matching the Authorization header
      message = `User not found for email address: ${credentials.name}`;
    }
  } else {
    //No user credentials/authorization header available
    message = 'Authorization header not found';
  }
  // Deny Access if there is anything stored in message
  if (message) {
    console.warn(message);
    const err = new Error('Access Denied');
    err.status = 401;
    next(err);
  } else {
    //User authenticated
    next();
  }
}



router.get('/users', authenticateUser, async (req, res, ) => {
  const users = await User.findByPk(
    req.body.id,
    {
      // Excludes unneeded private information 
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt']
      }
    }
  )
  res.json(users)

});

router.post('/users', async (req, res) => {
  if (req.body.password) {
    //hashes password
    req.body.password = await bcryptjs.hashSync(req.body.password)
    //creates new user & validations for new user
    await User.create(req.body)
    res.location('/')
    res.status(201).end()
  } else {
    res.status(401).end()
  }
})


module.exports = router;

