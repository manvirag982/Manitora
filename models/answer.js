const mongoose=require('mongoose');
const user=require('./user');
const answerschema=new mongoose.Schema({
    userdata:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    ans:String

});

module.exports=mongoose.model('answer',answerschema);