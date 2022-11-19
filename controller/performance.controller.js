const challengerModel = require("../model/challenger.model")
const classModel = require("../model/class.model")
const performanceModel = require("../model/performance.model")
const createError = require("../utils/errors")
const Challenger = require("../model/challenger.model");
const User = require("../model/user.model");


const PerformanceController = {
    addPerformance : async (req,res) => {
        const {mentorID,classID, challengerID} = req.body
        if (!mentorID || !classID || !challengerID) {
            res.status(400).json(createError(false,'Thieu thong tin bat buoc'))
        }
        try {
            const listPerformByChallengerID = await performanceModel.find({
                challengerID : challengerID
            })
            if (listPerformByChallengerID.length > 1) {
                return res.status(400).json(createError(false,'Da ton tai list perform theo challengerID'))
            }
            const listStudentByClass = await classModel.findById(classID)
            listStudentByClass.student.map(
                item => {
                    const newPerformacne = new performanceModel({
                        mentorSent : mentorID,
                        challengerID : challengerID,
                        toStudent : item
                    })
                    newPerformacne.save()
                }
            )
            await challengerModel.findByIdAndUpdate(challengerID,{
                sentStatus : true
            })
            return res.status(200).json(createError(true,'Them moi performance theo chl thanh cong!'))
        } catch (error) {
            console.log(error)
            return res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    getPerformancebyStudent : async (req,res) => {
        const {studentID} = req.params
        try {
            if (!studentID) {
                res.status(400).json(createError(false,'Thieu thong tin bat buoc'))
            }

            const listPerfomace = await performanceModel.find({
                toStudent : studentID
            }).populate(
                {
                    path : 'challengerID',
                    select : 'name type _id note classID',
                    populate :{
                        path : 'type classID',
                        select : 'shortname name code'
                    }
                }
            )
            res.status(200).json({...createError(true,'Get list perform thanh cong'),listPerfomace})
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    updatePerformace : async (req,res) => {
        const {id} =  req.params
        const {status,score,comment} = req.body
        if (!id) {
            return res.status(400).json(createError(false,'Thieu thong tin bat buoc'))
        }
        try {
            const item = await performanceModel.findById(id)
            if (!item) {
                return res.status(400).json(createError(false,'Khong ton tai performace'))
            }
            await performanceModel.findByIdAndUpdate(id,{
                status : status,
                score : score,
                comment : comment
            })
            const updatedItem = await performanceModel.findById(id)
            return res.status(200).json({...createError(true,'Update thanh cong'),updatedItem})
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    }
}

module.exports = PerformanceController