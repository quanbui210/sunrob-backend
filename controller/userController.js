const User = require('../model/User')
const {StatusCodes} = require('http-status-codes')
const {createTokenUser, attachCookies, checkPermissions} = require('../utils')
const Order = require('../model/Order')
const getAllUsers = async(req, res) => {
    const allUsers = await User.find({role: "User"}).select("-password").populate('orders')
    if (allUsers.length < 1) {
        res.json({msg: "no user found"})
    }
    res.status(StatusCodes.OK).json({allUsers})
}
const getOneUser = async(req, res) => {
    const user = await User.findOne({_id: req.params.id}).select("-password")
    user.orders = await Order.find({user: req.user.userId})
    if (!user) {
        res.json({msg: `no user with id:${req.params.id} found`})
    }
    checkPermissions(req.user, user._id)
    res.status(StatusCodes.OK).json({user})
}
const showCurrentUser = async(req, res) => {
    res.status(StatusCodes.OK).json({user: req.user})
}

const updateUser = async(req, res) => {
    const {email, name} = req.body
    if (!name || !email) {
        throw new Error('Please provide enough information')
    }
    const user = await User.findOne({_id: req.user.userId})
    user.email = email
    user.name = name
    await user.save()
    const tokenUser = createTokenUser(user)
    attachCookies({req, user: tokenUser})
    res.status(StatusCodes.OK).json({user: tokenUser})
}
const updateUserPassword = async(req, res) => {
    const {oldPassword, newPassword} = req.body
    const user = await User.findOne({_id: req.user.userId})
    
    if (!oldPassword || !newPassword) {
        throw new Error('please provide enough info')
    } 
    const passwordMatches = await user.comparePassword(oldPassword)
    if (!passwordMatches) {
        throw new Error('password does not match')
    } 
    user.password = newPassword
    await user.save()
    res.status(StatusCodes.OK).json({
        msg: "Password update successfully",
    })
    res.send('pw')
}
const deleteUser = async(req, res) => {
    res.send('Ban user')
}
module.exports = {
    getAllUsers, getOneUser, showCurrentUser,
    updateUser, updateUserPassword, deleteUser
}
