const mongoose = require('mongoose');
const ChallengerModel =  new mongoose.Schema({
    classID : {
        type : mongoose.Schema.Types.ObjectId,
        require : true
    },
    type : {
        type : mongoose.Schema.Types.ObjectId,
        require : true,
        ref : 'challengerType'
    },
    name : {
        type : String,
        require : true
    },
    note : {
        type : String
    }
},{timestamps : true})

module.exports = mongoose.model('challengers', ChallengerModel)