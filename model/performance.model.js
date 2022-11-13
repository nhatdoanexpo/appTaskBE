const mongoose = require('mongoose')
const PerformModel = new mongoose.Schema({
    mentorSent :{
        type : mongoose.Types.ObjectId,
        require : true,
        ref : 'users'
    },
    challengerID : {
        type : mongoose.Types.ObjectId,
        ref : 'challengers',
        require : true
    },
    toStudent : {
        type : mongoose.Types.ObjectId,
        ref : 'users',
        require : true
    },
    status : {
        type : String,
        enum : ['Hoàn tất','Đang thực hiện','Đã gửi'],
        default : 'Đã gửi'
    },
    scrore : {
        type : Number
    },
    comment : {
        type : String
    }
},{timestamps : true})

module.exports = mongoose.model('performance',PerformModel)