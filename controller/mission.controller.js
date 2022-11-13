const MissionModel = require('../model/mission.model')
const ChallengerModel = require('../model/challenger.model')
const {createError} = require('../utils/errors')

const missionController = {
    addMission : async (req, res) => {
        const {challengerID, des, note} = req.body
        if (!challengerID || !des) {
            return res.status(200).json(createError(false,'Thieu thong tin bat buoc'))
        }
        try {
            const newMission = new MissionModel({
                challengerID : challengerID,
                des : des,
                note : note
            })
            await newMission.save()

            res.status(200).json(newMission)
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    updateMission : async (req,res) => {
        const {missionID} = req.params
        const {des,note} = req.body
        try {
            const updateMission = await MissionModel.findByIdAndUpdate(missionID, {
                des : des,
                note : note
            }, {new : true})
            res.status(200).json({...createError(true,'Update tahnh cong'),updateMission})
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    deleteMission : async (req,res) => {
        const {missionID} = req.params
        try {
            await MissionModel.findByIdAndDelete(missionID)
            res.status(200).json(createError(true,'Xoa thanh cong mission'))
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    getMissionByChallengerID : async (req,res) => {
        const {challengerID} = req.params
        try {
            const challenger = await ChallengerModel.findById(challengerID)
            if (!challenger) {
                return res.status.json(createError(false,'Khong ton tai thu thach'))
            }
            const listMission = await MissionModel.find({
                challengerID : challengerID
            })
            res.status(200).json(listMission)
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    }
}


module.exports = missionController;