/*
 question string
 ref user
 answer  array ref comment
*/
const user=require('./user');
const answer=require('./answer');
const mongoose=require('mongoose');

const queryschema=new mongoose.Schema({

      question: String,
      userdetail:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
      likes:{
        type:Number,
        default: 0
      },
      answers:[
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'answer'
          }
      ]
    
});

queryschema.post('findOneAndDelete', async function (doc) {
  if (doc) {
      await answer.deleteMany({
          _id: {
              $in: doc.answers
          }
      })
  }
})
module.exports=mongoose.model('query',queryschema);