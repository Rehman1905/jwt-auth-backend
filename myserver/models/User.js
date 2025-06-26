const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    resetCode:{
        type:String,
        default:null
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    }
})
module.exports=mongoose.model('User',userSchema)