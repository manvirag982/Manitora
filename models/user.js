const mongoose=require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userschema=new mongoose.Schema({
    username:String,
    name: String,
    email: String,
    branch: String,
    college: String
});
userschema.plugin(passportLocalMongoose);
module.exports=mongoose.model('user',userschema);