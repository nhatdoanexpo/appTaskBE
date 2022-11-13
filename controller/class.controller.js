const classModel = require("../model/class.model")
const createError = require("../utils/errors")

const ClassController = {
    addClass : async (req, res) => {
        const {code, name, note, mentor} = req.body     
        if (!code || !name){
            return res.status(400).json(createError(false,'Thieu thong tin bat buoc'))
        }
        try {
            const classcode = await classModel.findOne({code : code})
            if (classcode) {
                return res.status(200).json(createError(false,'Da ton tai ma lop hoc'))
            }
            // all good : 
            const newClass = new classModel({
                code : code,
                name : name,
                note : note,
                mentor : mentor
            })
            await newClass.save()
            res.status(200).json(createError(true,'Tao lop thanh cong'))
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    getListClass : async (req,res) => {
        const {code, name} = req.query
        console.log(code,name)
        try {
            const listClass = await classModel.find({
            //    $or : [
            //     {'code' : { $regex: '.*' + code + '.*' }},
            //     {'name' : { $regex: '.*' + name + '.*' }}
            //    ] }
            })
            res.status(200).json({...createError(true,'Get list lop thanh cong'),listClass})
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    getClass : async (req,res) => {
        const {id} = req.params
        try {
            const findClass = await classModel.findById(id)
            res.status(200).json(findClass)
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    editClass : async (req, res) => {
        const {id}= req.params
        const {code, name, note,mentor} = req.body
        try {
            if (!code || !name) {
                return res.status(200).json(createError(false, 'Thieu thong tin bat buoc'))
            }
            // all good :
            await classModel.findByIdAndUpdate(id ,
                {
                    code : code,
                    name : name,
                    note : note,
                    mentor : mentor
                })
            res.status(200).json(createError(true,'Update thanh cong'))
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    deleteClass : async (req, res) => {
        const {id} = req.params
        try {
            await classModel.findByIdAndDelete(id)
            return res.status(200).json(createError(true,'Xoa thanh cong'))
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    getClassByMentor : async (req,res) => {
        const {userID} = req.params 
        try {
            const listClassByMentor = await classModel.find({
                mentor : userID
            })
            console.log(listClassByMentor)
            res.status(200).json({listClass : listClassByMentor,...createError(true,'Get list theo GV')})
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    }
}

module.exports = ClassController;