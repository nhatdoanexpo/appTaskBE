const mongoose = require('mongoose');
const ChallengerTypeModel = new mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    shortname : {
        type : String,
        require : true,
        unique : true
    },
    name : {
        type : String,
        require : true
    }
},{timestamps : true})

module.exports = mongoose.model('challengerType', ChallengerTypeModel);