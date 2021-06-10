const express=require('express');
const ejs=require('ejs');
const ejsmate=require('ejs-mate');
const path = require('path');
const app=express();
const LocalStrategy= require("passport-local");   
const User= require("./models/user");   
const Query= require("./models/query");   
const Answer= require("./models/answer");   
const mongoose=require('mongoose');
const passport = require('passport');
const passportLocalMongoose   = require("passport-local-mongoose");


// const query=require('./models/query');
// const answer=require('./models/answer');


const expressSession = require('express-session')({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
});
app.use(expressSession);
mongoose.connect('mongodb://localhost:27017/my_manitora', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify:false
});

app.use(passport.initialize());
app.use(passport.session());
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(express.urlencoded({ extended: true })); 

app.set('view engine','ejs');
app.engine('ejs',ejsmate);
// console.log(path.join(__dirname, 'public'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/',(req,res)=>{
    // console.log(req.user);   
    res.render('home',{currentuser:req.user});
})
app.post('/',async (req,res)=>{
    User.register(
        
        new User(
            {
                username : req.body.username,
                email:req.body.email,
                name:req.body.name,
                college:req.body.college,
                branch:req.body.branch            
            }
            ),req.body.password, function(err, user){
                if(err){            
                        console.log(err);            
                        return res.render('signup');        
                    }
            passport.authenticate("local")(req, res, function(){
                    res.redirect('/');
            });     
  });
  
})

app.get('/login',(req,res)=>{
    res.render('login',{currentuser:req.user})

})
app.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('login');

})
app.post('/login',passport.authenticate('local',{
    successRedirect: "/",
    failureRedirect: "/login"
}),function(req,res){

});
app.get('/profile',(req,res)=>{
    res.render('profile',{currentuser:req.user});
});
app.get('/discussion',async (req,res)=>{
    if(req.isAuthenticated()){
    const querys=await Query.find({}).populate('answers').populate('userdetail');    
    res.render('discussion',{currentuser:req.user,queries:querys});
    }
    else{
        res.redirect('login');
    }
})

app.get('/ask',(req,res)=>{
    if(req.isAuthenticated()){
    res.render('ask',{currentuser:req.user})
    }
    else{
        res.redirect('login');
    }
})

app.get('/signup',(req,res)=>{
    res.render('signup',{currentuser:req.user});
})

app.post('/discussion',async (req,res)=>{
    
    const dataquery=new Query({
        question:req.body.question
    });
    dataquery.userdetail=req.user._id;
    await dataquery.save();
    res.redirect('discussion');
})
app.get('/discussion/:id',async (req,res)=>{
    const {id}=req.params;
    await Query.findByIdAndDelete(id);
    res.redirect('/discussion');
})
app.get('/like/:id',async (req,res)=>{
        const {id}=req.params;
         await Query.findByIdAndUpdate(id,{$inc : {'likes' : 1}});

         res.redirect('/discussion');


});
app.get('/comment/:id',async (req,res)=>{
    if(req.isAuthenticated()){
      const {id}=req.params;

      const Ques=await Query.findById(id).populate('userdetail').populate({
          path:'answers',
          populate:{path:'userdata'}
      });
      
      res.render('querycomment',{currentuser:req.user,ques:Ques});
      }
      else{
          res.redirect('/login');
      }
});
app.post('/comment/:id',async (req,res)=>{  
   const {id}=req.params;
   const answerdata=new Answer({
       ans:req.body.ans,
       userdata:req.user
   });
   const current=await Query.findById(id);
   current.answers.push(answerdata); 
   await answerdata.save();
   await current.save();
   res.redirect(`/comment/${id}`);
});

app.get('/comment/:id/answer/delete/:answerid' ,async (req,res)=>{
    const {id,answerid}=req.params;
    // res.send(req.params);
    const curans=await Answer.findById(answerid);
    if(curans){
    const curque=await Query.findByIdAndUpdate(id,{
        $pull:{
           answers:curans._id
        }
    })
    await curque.save();
    await Answer.findByIdAndDelete(answerid);
    }
    
    res.redirect(`/comment/${id}`);
})
app.listen(8080,()=>{
    console.log('Port at 8080')
})