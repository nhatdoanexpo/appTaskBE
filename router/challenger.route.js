const express = require('express')
const router = express.Router()
const challengerController = require ('../controller/challenger.controller')
const {verifyToken, verifyTokenGVandAdmin, verifyAdmin} = require('../middleware/auth.middleware')

// @route POST api/ath/register
// @desc Register user
// @access Public

router.get('/type' ,challengerController.getAllChallengerType )
router.get('/type/:id', challengerController.getChallengerType)
router.post('/type',challengerController.addChallengerType)
router.put('/type/:id',challengerController.editChallengerType)
router.delete('/type/:id', challengerController.deleteChallengerType)


// Challenger : 
router.post('/', challengerController.addChallenger)
router.put('/:id',challengerController.editChallenger)
router.delete('/:id', challengerController.deleteChallenger)
router.get('/challengerbyClass/:classID',challengerController.getChallengerByClass)
router.get('/detail/:id', challengerController.getChallengerByID)



module.exports = router;