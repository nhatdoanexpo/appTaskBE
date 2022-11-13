const createError = require("../utils/errors")
const ChallengerType = require('../model/chanllengerType.model')
const Challenger = require('../model/challenger.model')
const { default: mongoose } = require("mongoose")

const challengerController = {
    // Chalenger Type
    addChallengerType : async (req, res) =>{
        const {shortname, name} = req.body 
        if (!shortname || !name) {
            return res.status(400).json(createError(false,'Thieu thong tin bat buoc'))
        }
        const challenger = await ChallengerType.findOne({shortname : shortname})

        try {
            if (challenger) {
                return res.status(200).json(createError(false,'Trung ma loai thu thach'))
            }
            // all good :
            const newTypeChallenger = new ChallengerType({
                _id : new mongoose.Types.ObjectId,
                shortname : shortname,
                name : name
            })
            await newTypeChallenger.save()
            res.status(200).json(createError(true,'Tao thanh cong loai thu thach'))
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    editChallengerType : async(req,res) => {
        const { id} = req.params
        const {shortname, name} = req.body
        try {
            const editchallengerType = await ChallengerType.findByIdAndUpdate(id, {
                shortname : shortname,
                name : name
            },{new : true})
            res.status(200).json({...createError(true,'Edit thanh cong'),editchallengerType})
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    deleteChallengerType : async(req,res) => {
        const {id} = req.params
        try {
            await ChallengerType.findByIdAndDelete(id)
            res.status(200).json(createError(true,'Xoa thanh cong'))
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    getAllChallengerType : async (req,res) => {
        try {
            const ChallengerTypes = await ChallengerType.find()
            res.status(200).json({...createError(true,'Lay danh sach loai thu thach'),ChallengerTypes})
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    getChallengerType : async(req,res) => {
        const {id} = req.params
        try {
            const type = await ChallengerType.findOne({_id : id})
            res.status(200).json(type)
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    // Challengers : 
    addChallenger : async (req, res) => {
        const {classID,type, name, note} = req.body
        if (!classID || !type ||!name) {
            return res.status(400).json(createError(false,'Thieu thong tin bat buoc'))
        }
        try {
            const newChalenger = new Challenger({
                classID : classID,
                type : type,
                name : name,
                note : note
            })
            await newChalenger.save()
            res.status(200).json(createError(true,'Tao thu thach thanh cong'))
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    editChallenger : async (req,res) => {
        const {id} = req.params
        const {type, name, note} = req.body
        if (!type || !name) {
            return res.status(400).json(createError(false,'Thieu thong tin bat buoc'))
        }
        try {
            await Challenger.findByIdAndUpdate(id , {
                type : type,
                name : name,
                note : note
            })
            res.status(200).json(createError(true,'Sua thu thach thanh cong'))
        } catch (error) {
            console.log(error)
            res.status(500).json('Loi he thong')
        }
    },
    deleteChallenger : async (req, res) => {
        const {id } = req.params
        try {
            await Challenger.findByIdAndDelete(id)
            res.status(200).json(createError(true,'Xoa thu thach thanh cong'))
        } catch (error) {
            console.log(error)
            res.status(500).json('Loi he thong')
        }
    },
    getChallengerByClass : async (req, res) => {
        const {classID} = req.params
        try {
            const listChallenger = await Challenger.find({classID : classID}).populate({
                path : 'type',
                select : 'name shortname'
            })
            res.status(200).json({...createError(true,'Thanh cong'),listChallenger})
        } catch (error) {
            console.log(error)
            res.status(500).json('Loi he thong')
        }
    },
    getChallengerByID : async (req,res) => {
        const {id} = req.params
        try {
            const detailchallenger = await (await Challenger.findById(id))
            res.status(200).json(detailchallenger)
        } catch (error) {
            console.log(error)
            res.status(500).json('Loi he thong')
        }
    }
}

module.exports = challengerController;