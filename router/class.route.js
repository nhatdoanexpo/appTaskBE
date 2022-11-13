const express = require('express');
const ClassController = require('../controller/class.controller')

const router = express.Router()
const {verifyAdmin, verifyTokenGVandAdmin} = require('../middleware/auth.middleware')


router.post('/', ClassController.addClass)
router.get('/', ClassController.getListClass)
router.get('/:id',ClassController.getClass),
router.put('/:id',ClassController.editClass)
router.delete('/:id', ClassController.deleteClass)
router.get('/getclassmentor/:userID',ClassController.getClassByMentor)




module.exports = router;