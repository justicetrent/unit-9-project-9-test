// Constructing a router instance.
const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Courses = require('../models').Courses;
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth')

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
        req.currentUser = user;
        /*if (req.originalUrl.includes('courses')) {
              //If route has a courses endpoint, set request userId to matched user id
              req.body.userId = user.id;
            } else if (req.originalUrl.includes('users')) {
              //If route has a users endpoint, set request id to matched user id
              req.body.id = user.id;
            }
        */
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


router.get('/users', authenticateUser, (req, res, next) => {
  res.status(200);

  const jsonResponse = req.currentUser;

  delete jsonResponse["password"];
  delete jsonResponse["createdAt"];
  delete jsonResponse["updatedAt"];

  res.json(jsonResponse);
});

// // ************************* User Routes ****************************
// router.get('/users', authenticateUser, async (req, res, next) => {
//   const users = await User.findByPk(
//     req.body.id,
//     {
//       // Excludes unneeded private information 
//       attributes: {
//         exclude: [ 'createdAt', 'updatedAt']
//       }
//     }
//   )
//   res.json(users)

// });

router.post('/users', async (req, res, next) => {
  try {
    if (req.body.password) {
      //hashes password
      req.body.password = bcryptjs.hashSync(req.body.password)
      //creates new user & validations for new user
      console.log(req.body)

      let newUser = await User.create(req.body)
      console.log(newUser)
      res.location('/')
      res.status(201).end()
    } else {
      res.status(400).json({
        message: 'User needs to provide to enter all necessary information to create a new account',
      });
    }
  }
  catch (error) {
    console.log(error)
    res.status(404).json({
      message: 'page not found',
    });
  }
})

//*************** Coures Routes ********************* */

router.get('/courses', async (req, res, next) => {
  const courses = await Courses.findAll({

    // Excludes unneeded private information 
    attributes: {
      exclude: ['createdAt', 'updatedAt']
    },
    include: [
      {
        model: User,
        as: 'User'
      },
    ],
  })
  res.json(courses)
});

router.get('/Courses/:id', async (req, res, next) => {
  try {
    const courseId = await Courses.findOne({
      where: {
        id: req.params.id
      },
      include: [
        {
          model: User,
          as: 'User'
        },
      ],
    })
    if (courseId === null) {
      res.status(404)
      res.json('No Course found')
    }
    else {
      res.json(courseId)
    }
  } catch (err) {
    console.log('500: Internal Server Error');
    next(err);
  }
})

// Post Route with authentication for Course titles

router.post('/Courses', authenticateUser, async (req, res, next) => {
  try {
    if (req.body.title && req.body.description) {
      const newCourse = await Courses.create(req.body)
      res.location(`/api/course/${newCourse.id}`)
      res.status(201).end()
    } else {
      res.status(404).json({
        message: 'User needs to provide a title and a description',
      });
    }

  }
  catch (error) {
    console.log(error)
    res.status(404).json({
      message: error.errors,
    });
  }
})

// Delete course route with user authentication 

router.delete("/courses/:id", authenticateUser, async (req, res, next) => {
  try {
    const courseDelete = await Courses.findByPk(req.params.id)
    if (courseDelete.userId === req.currentUser.id) {
      await courseDelete.destroy();
      res.status(204).end();
    } else {
      res.status(403).end();
    };
  }
  catch (err) {
    console.log("Forbidden: you are not the correct user");
    next(err);
  }
})

//Put course route with user authentication 
router.put('/courses/:id', authenticateUser, async (req, res, next) => {
  try {
    const courseUpdate = await Courses.findByPk(req.params.id);
    if (courseUpdate === null) {
      res.status(404).json({
        message: 'Course does not exist'
      });
  }
    if (courseUpdate.userId === req.currentUser.id) {
      if (req.body.title && req.body.description) {
        courseUpdate.update(req.body);
        res.status(204).end()
      } else {
        res.status(400).json({
          message: 'User needs to provide a title and a description',
        });
      }

    } else
      res.status(401).json({
        message: 'user not authorized to update this course',
      });
  } catch (error) {
    console.log(error)
    res.status(404).json({
      message: error.errors,
    });
  }
});

// send 404 if no other route matched
router.use((req, res, next) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
router.use((err, req, res, next) => {

  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});


module.exports = router;

