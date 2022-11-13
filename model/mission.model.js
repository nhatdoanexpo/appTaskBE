const mongoose = require('mongoose')
const MissionModel = new mongoose.Schema({
    challengerID  : {
        type : mongoose.Types.ObjectId,
        require : true
    },
    des : {
        type : String,
        require : true
    },
    note : String
},{timestamps : true})

module.exports = mongoose.model('mission', MissionModel)