const argon2 = require('argon2')
const jwt = require('jsonwebtoken')

const User = require('../model/user.model');
const createError = require('../utils/errors');
const classModel = require("../model/class.model");
const performanceModel = require("../model/performance.model");
const Challenger = require("../model/challenger.model");

const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, './images');
    },
    filename(req, file, callback) {
        callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({ storage });

// dung tam sau add redis sau :
let refreshTokens = []
const authController = {
    registerUser: async (req, res) => {
        const { name, email, password, role } = req.body

        // Simple validation :
        if (!email || !password || !name) {
            return res.status(400).json(createError(false, 'Thieu thong tin bat buoc'))
        }
        try {
            //  Kiem tra email da ton tai chua 
            const user = await User.findOne({ email: email })
            if (user) {
                return res.status(400).json(createError(false, 'Tai khoan da ton tai'))
            }

            // all good  :
            const hashPasword = await argon2.hash(password)
            const newUser = new User({
                name: name,
                email: email,
                password: hashPasword,
                role: role
            })
            await newUser.save()

            res.status(200).json(createError(true, 'Tao TK thanh cong'))
        } catch (error) {
            console.log(error)
            res.status(500).json(createError(false, 'Loi he thong'))
        }
    },

    // GENERATE ACCESS TOKEN
    generateAccessToken: (user) => {
        return jwt.sign({
            userID: user._id,
            role: user.role
        }, `${process.env.ACCESS_TOKEN_SECRET}`, { expiresIn: '30d' }
        )
    },

    // GENERATE REFRESH TOKEN : 
    generateRefreshToken: (user) => {
        return jwt.sign({
            userID: user._id,
            role: user.role
        }, `${process.env.JWT_REFRESH_KEY}`,
            { expiresIn: '365d' })
    }
    ,
    loginUser: async (req, res) => {
        const { email, password ,pushtoken} = req.body
        // Simplate validation : 
        if (!email || !password) {
            return res.status(400).json(createError(false, 'Thieu thong tin bat buoc'));
        }

        try {
            // Kiem tra email co ton tai trong he thong khong ? 
            const user = await User.findOne({ email: email })
            if (!user) {
                return res.status(200).json(createError(false, 'Tai khoan khong ton tai'))
            }

            const passwordValid = await argon2.verify(user.password, password)
            if (!passwordValid) {
                return res.status(200).json(createError(false, 'Sai mat khau'))
            }

            // all good  
            // return accToken
            const accessToken = authController.generateAccessToken(user)
            // return rfToken 
            const refreshToken = authController.generateRefreshToken(user)
            refreshTokens.push(refreshToken)
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                path: '/',
                sameSite: "strict"
            })
            await User.findOneAndUpdate({
                pushtoken : pushtoken
            })
            let error = createError(true, 'Dang nhap thanh cong')
            // console.log({...error,role : user.role, accessToken})

            const userMap = { id : user?._doc._id ,
                name:  user?._doc?.name,
                code: user?._doc?.code,
                email: user?._doc?.email,
                role: user?._doc?.role
            }

            const listClassUser = await  classModel.find({ student : {$elemMatch : { user : userMap.id } }});

            const listClassUserMap = listClassUser.map( x => {
                return { id : x?._doc?._id  ,name: x._doc?.name,
                    mentor: x?._doc?.mentor}
            } );


           if(listClassUserMap && userMap.role == 'HV'){
               for (const item of listClassUserMap) {

                   const listChallenger = await Challenger.find({classID : item.id}).exec();

                   const listChallengerMap = listChallenger.map( x => {
                       return { id : x?._doc?._id }
                   } );

                   if(listChallengerMap){
                       for (const challen of listChallengerMap) {

                           const performance =  await performanceModel.findOne({challengerID : challen.id,
                               mentorSent : item.mentor, toStudent : userMap.id
                           });

                          if(!performance){
                              const newPerformacne = new performanceModel({
                                  mentorSent : item.mentor,
                                  challengerID : challen.id,
                                  toStudent : userMap.id
                              })
                              await newPerformacne.save()
                          }


                       }
                   }

               }
           }




            res.status(200).json({ ...error, role: user.role, accessToken, pushtoken ,
                user: userMap, listClassData: listClassUserMap})
        } catch (error) {
            console.log(error)
            return res.status(500).json(
                createError(false, 'Loi he thong')
            )
        }
    },
    requestRefreshToken: async (req, res) => {
        // Take refresh token from user
        const refreshToken = req.cookies.refreshToken

        if (!refreshTokens.includes(refreshToken)) {
            return res.status(403).json('Refresh Token is not valid')
        }

        if (!refreshToken) return res.status(401).json("You're not authenticated")
        jwt.verify(refreshToken, `${process.env.JWT_REFRESH_KEY}`, (err, user) => {
            if (err) {
                console.log(err)
            }

            refreshTokens = refreshTokens.filter((token) => token !== refreshToken)

            // Create new accress token , rf token
            const newAccessToken = authController.generateAccessToken(user);
            const newRfToken = authController.generateRefreshToken(user)

            res.cookie("refreshToken", newRfToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict"
            })
            res.status(200).json({
                accessToken: newAccessToken
            })
        })

    },
    userLogout: async (req, res) => {
        res.clearCookie('refreshToken')
        refreshTokens = refreshTokens.filter((token) => token !== req.cookies.refreshToken)
        res.status(200).json('Logged out !')
    },
    getAllUser: async (req, res) => {
        const listUsser = await User.find()
        try {
            res.status(200).json(listUsser)
        } catch (error) {
            console.log(error)
            return res.status(500).json(
                createError(false, 'Loi he thong')
            )
        }
    },
    getUser: async (req, res) => {
        try {
            const {id} = req.params
            const user = await User.findById(id)
            const userMap = { id : user?._doc._id ,
                name:  user?._doc?.name,
                code: user?._doc?.code,
                email: user?._doc?.email,
                role: user?._doc?.role
            }

            const listClassUser = await  classModel.find({ student : {$elemMatch : { user : userMap.id } }});

            const listClassUserMap = listClassUser.map( x => {
                return { id : x?._doc?._id  ,name: x._doc?.name,
                    mentor: x?._doc?.mentor}
            } );

            if(listClassUserMap && userMap.role == 'HV'){
                for (const item of listClassUserMap) {

                    const listChallenger = await Challenger.find({classID : item.id}).exec();

                    const listChallengerMap = listChallenger.map( x => {
                        return { id : x?._doc?._id }
                    } );

                    if(listChallengerMap){
                        for (const challen of listChallengerMap) {

                            const performance =  await performanceModel.findOne({challengerID : challen.id,
                                mentorSent : item.mentor, toStudent : userMap.id
                            });

                            if(!performance){
                                const newPerformacne = new performanceModel({
                                    mentorSent : item.mentor,
                                    challengerID : challen.id,
                                    toStudent : userMap.id
                                })
                                await newPerformacne.save()
                            }


                        }
                    }

                }
            }


            if(user){
                res.status(200).json( { user: userMap, listClassData: listClassUserMap})
            }else{
                res.status(400).json(
                    createError(false, 'không tìm thấy')
                )
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json(
                createError(false, 'Loi he thong')
            )
        }
    },
    uploadImage: async (req, res) => {
        try {
            app.get('/', (req, res) => {
                res.status(200).send('You can post to /api/upload.');
            });

            app.post('/api/upload', upload.array('photo', 3), (req, res) => {
                console.log('file', req.files);
                console.log('body', req.body);
                res.status(200).json({
                    message: 'success!',
                });
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json(
                createError(false, 'Loi he thong')
            )
        }
    }

}

module.exports = authController;