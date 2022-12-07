const classModel = require("../model/class.model")
const createError = require("../utils/errors")
const User = require("../model/user.model");

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
            let classMap = [];
            console.log(listClassByMentor)
            if(listClassByMentor){
                for (const item of listClassByMentor) {
                    let classItem = item?._doc
                    let students = classItem?.student;
                    let studentsMap = [];
                    for (const st of students) {
                    const user = await User.findOne({ _id: st?._doc.user })
                    const userMap = { id : user?._doc._id ,
                        name:  user?._doc?.name,
                        code: user?._doc?.code,
                        email: user?._doc?.email,
                        role: user?._doc?.role
                    }
                     console.log(userMap)
                     studentsMap.push(userMap)
                    }
                    classItem = {...classItem, studentsDetail:studentsMap}
                    classMap.push(classItem)
                }

            }
            console.log(listClassByMentor)
            res.status(200).json({listClass : classMap,...createError(true,'Get list theo GV')})
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    addStudent : async (req,res) => {
        const {listStudent} = req.body
        const {classID} = req.params

        try {
            const classData = await classModel.findOne({
                _id : classID
            })
            if (!classData) {
                res.status(400).json(createError(false,'Khong ton tai thong tin lop hoc'))
            }else {


                await classModel.findByIdAndUpdate(classID,{
                    student : listStudent
                })
                res.status(400).json(createError(true,'Add hoc sinh thanh cong'))
            }
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
    getClassByStudent : async(req,res) => {
        const {userID} = req.params
        try {
            const classData = await classModel.find({
                student: {
                    "$in" : [userID]
                }
            }).populate({
                path : "mentor",
                select : "name email",
                remove : '_id'
            })
            if (!classData) {
                res.status(200).json(createError(false,'Khong co thong tin lop hoc'))
            }
            res.status(200).json(classData)
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false,'Loi he thong'))
        }
    },
}

module.exports = ClassController;