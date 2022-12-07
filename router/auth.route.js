const express = require('express')
const router = express.Router()
const authController = require('../controller/auth.controller')
const middleware = require('../middleware/auth.middleware')

// @route POST api/ath/register
// @desc Register user
// @access Public

router.post('/register',authController.registerUser)
router.post('/login', authController.loginUser)
router.post('/refresh',authController.requestRefreshToken)
router.get('/listuser',middleware.verifyAdmin,authController.getAllUser)
router.get('/userById/:id',authController.getUser)
router.post('/uploadImage',authController.uploadImage)


module.exports = router;