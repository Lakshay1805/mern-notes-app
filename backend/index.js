require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const {authenticateToken} = require("./middleware.js")
const User = require("./models/user.js")
const Note = require("./models/note.js")


app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.get("/" , (req,res) =>{
    res.json({data:"hello"});
})
//user routes
app.post("/register" ,async(req,res)=>{
    let {fullName,email,password} = req.body;
    if(!fullName){
        return res.status(400).json({error:true , message:"Enter your name"})
    }
    if(!email){
        return res.status(400).json({error:true , message:"Enter your email"})
    }
    if(!password){
        return res.status(400).json({error:true , message:"Enter your password"})
    }
    const isUser = await User.findOne({email});
    if(isUser){return res.status(400).json({message:"User already exists"})}
    const salt =await bcrypt.genSalt(10);
    const hash =await bcrypt.hash(password,salt);

    const user = new User({
        fullName,
        email,
        password : hash
    })
    await user.save();
    const token = jwt.sign({ id: user._id, email: user.email } , process.env.ACCESS_TOKEN,{
        expiresIn:"36000m"
    })
    res.cookie("token" , token);
    return res.json({
        error:false,
        user:{
            id: user._id,
          fullName: user.fullName,
          email: user.email
        },
        token,
        message:"Registration Successful"
    })
})

app.post("/login" , async(req,res)=>{
    let {email , password} = req.body;
    if(!email){
        return res.status(400).json({error:true , message:"Enter an email"})
    }
    if(!password){
        return res.status(400).json({error:true , message:"Enter a password"})
    }
    let user = await User.findOne({email:email});
    if (!user) {
    return res.status(400).json({
        error: true,
        message: "User not found"
    });}
   const isMatch =await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({
            error: true,
            message: "Wrong password"
        });
    }
    let token = jwt.sign({id:user._id , email:user.email} , process.env.ACCESS_TOKEN , { expiresIn:"36000m"})
    res.cookie("token" , token);
    return res.json({
        error:false,
        message:"Login successful",
        user:{
            id: user._id,
            email: user.email,
            fullName: user.fullName
        },
        token
    })
})
app.post("logout" , (req,res)=>{
    res.clearCookie("token");
})
app.get("/user" , authenticateToken , async(req,res)=>{
    let userId = req.user.id;
    let user = await User.findById(userId);
    if(!user){
        return res.status(400).json({error:true,message:"User don't exists"})
    }
    return res.json({
        error:false,
        user
    })
})

//notes routes
app.post("/create",authenticateToken , async(req,res)=>{
    let {title , content , tags} = req.body;
    if(!title){
        return res.status(400).json({error:true , message:"Enter a title"})
    }
    if(!content){
        return res.status(400).json({error:true , message:"Enter the content"})
    }
    let note = new Note({
        title:title,
        content:content,
        tags:tags || [],
        userId:req.user.id
    })
    await note.save();

    return res.json({
        error:false,
        message:"Note created successfully",
        note
    })
})
app.put("/edit/:id" , authenticateToken , async(req,res) =>{
    let {id} = req.params;
    let {title , content, tags , isPinned} = req.body;
    if(!title || !content){
        return res.status(400).json({error:true , message:"No changes done"})
    }
    const note = await Note.findById(id);
    if(!note){
        return res.status(400).json({message:"Note not found"})
    }
    if(title) note.title = title;
    if(content) note.content = content;
    if(tags) note.tags = tags;
    if(isPinned !== undefined) note.isPinned = isPinned;

    await note.save();

    return res.json({
        error:false,
        note,
        message:"Note updated successfully",
    })
})
app.get("/notes",authenticateToken , async(req,res) =>{
    let id = req.user.id;
    let notes = await Note.find({userId:id}).sort({isPinned:-1});
    return res.json({
        error:false,
        message:"Here is list of your all notes",
        notes
    })
})
app.delete("/delete/:id" , authenticateToken , async(req,res)=>{
    let {id} = req.params;
    let note = await Note.findById(id);
    if(!note){
        return res.status(400).json({error:true , message:"Note not found"})
    }
    await Note.deleteOne({_id:note._id});
    return res.json({
        error:false,
        message:"Note deleted successfully"
    })
})
app.put("/updateIsPin/:id" , authenticateToken , async(req,res)=>{
    let {id} = req.params;
    let {isPinned} = req.body;
    let note = await Note.findById(id);
    if(!note){
        return res.status(400).json({error:true, message:"Note not found"})
    }
    if(isPinned !== undefined){
        note.isPinned = isPinned;
        await note.save(); 
    }
    return res.json({
        error:false,
        message:"Pinned successfully",
        note
    })
})
app.get("/searchNotes", authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        error: true,
        message: "Search query is required"
      });
    }
    const notes = await Note.find({
        title: { $regex: query, $options: "i" }
    });
    return res.json({
      error: false,
      notes,
      message: "Notes fetched successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: true,
      message: "Server error"
    });
  }
});

app.listen(8000);
module.exports = app