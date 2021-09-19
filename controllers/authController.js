const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.signUp = async (req,res) => {

    const {username,password} = req.body;
   console.log(username,password);
    try {
        const hashpassword = await bcrypt.hash(password,12);

        const newUser = new User({username:username,password:hashpassword});
        console.log(newUser);
        await newUser.save();
        console.log(newUser);
        req.session.user = newUser;
        res.status(201).json({
            status : 'success',
            data  :{
                user : newUser
            }
        })

    }catch (e) {
    
        console.log(e);
        res.status(400).json({
            status : 'fail'
        })
    }
}

exports.login = async (req,res,next) => {
    const {username,password} = req.body;
    try {

        const user = await User.findOne({username:username});
     
        if (!user) {
            return res.status(404).json({
                status : 'fail',
                message : 'user not found'
            })
        }
        const isCorrect = await bcrypt.compare(password,user.password);
        if (isCorrect) {
            req.session.user = user; 
            res.status(200).json({
                status : 'success'
            })
        }else{
            res.status(200).json({
                status : 'fail',
                message : 'Incorrect username or password'
            })    
        }

    }catch (e) {
        console.log(e);
        res.status(400).json({
            status : 'fail'
        })
    }
}