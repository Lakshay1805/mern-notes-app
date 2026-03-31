require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const {authenticateToken} = require("./middleware.js")
const User = require("./models/user.js")
const Note = require("./models/note.js")
const { registerSchema, loginSchema, noteSchema, editNoteSchema, validate, errorHandler } = require("./validation.js")
const multer = require('multer')
const path = require("path")
const {storage}  = require("./cloudConfig.js");
const FRONTEND_URL = process.env.FRONTEND_URL;

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(cors({
    origin:[ "http://localhost:5173" , FRONTEND_URL],
    credentials: true
}));
app.use(cookieParser())
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
};

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: true, message: "Too many requests from this IP, please try again after 15 minutes" }
});

//user routes
app.post("/register", authLimiter , validate(registerSchema) ,async(req,res,next)=>{
    try{
    let {fullName,email,password} = req.body;
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
    const accessToken = jwt.sign({ id: user._id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user._id, email: user.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("refreshToken", refreshToken, cookieOptions);

        return res.json({
            error: false,
            user: { id: user._id, fullName: user.fullName, email: user.email },
            accessToken,
            message: "Registration Successful"
        });
    } catch(err) { next(err); }
})

app.post("/login",authLimiter , validate(loginSchema) , async(req,res,next)=>{
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: true, message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: true, message: "Wrong password" });

        const accessToken = jwt.sign({ id: user._id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: user._id, email: user.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("refreshToken", refreshToken, cookieOptions);

        return res.json({
            error: false,
            message: "Login successful",
            user: { id: user._id, email: user.email, fullName: user.fullName },
            accessToken
        });
    } catch(err) { next(err); }
})
app.post("/refresh", async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ error: true, message: "Refresh token missing" });

        const user = await User.findOne({ refreshToken });
        if (!user) return res.status(403).json({ error: true, message: "Invalid refresh token" });

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ error: true, message: "Invalid or expired refresh token" });

            const newAccessToken = jwt.sign({ id: user._id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
            return res.json({ error: false, accessToken: newAccessToken });
        });
    } catch(err) { next(err); }
});
app.post("/logout", async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const user = await User.findOne({ refreshToken });
            if (user) {
                user.refreshToken = "";
                await user.save();
            }
        }
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "strict",
        });
        return res.json({ error: false, message: "Logout successful" });
    } catch(err) { next(err); }
});
app.get("/user" , authenticateToken , async(req,res,next)=>{
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ error: true, message: "User don't exists" });
        return res.json({
            error: false,
            user: { id: user._id, fullName: user.fullName, email: user.email }
        });
    } catch(err) { next(err); }
})

//notes routes
app.post("/create",authenticateToken,validate(noteSchema), async(req,res,next)=>{
    try {
        const { title, content, tags, color , attachmentUrl} = req.body;
        const note = new Note({
            title,
            content,
            tags: tags || [],
            color: color || "white",
            attachmentUrl: attachmentUrl || null,
            userId: req.user.id
        });
        await note.save();
        return res.json({ error: false, message: "Note created successfully", note });
    } catch(err) { next(err); }
})
app.post(
  "/upload-attachment",
  authenticateToken,
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: true,
          message: "No file uploaded",
        });
      }
        const attachmentUrl = req.file.secure_url;
        console.log(attachmentUrl)
      return res.json({
        error: false,
        attachmentUrl,
        message: "Attachment uploaded successfully",
      });

    } catch (err) {
      next(err);
    }
  }
);
app.put("/edit/:id" , authenticateToken, validate(editNoteSchema) , async(req,res,next) =>{
    try {
        const { id } = req.params;
        const { title, content, tags, isPinned, isArchived, isTrashed, color, attachmentUrl } = req.body;
        if (!title && !content && !tags && isPinned === undefined && isArchived === undefined && isTrashed === undefined && color === undefined && attachmentUrl === undefined) {
            return res.status(400).json({ error: true, message: "No changes done" });
        }

        const note = await Note.findOne({ _id: id, userId: req.user.id });
        if (!note) return res.status(404).json({ error: true, message: "Note not found" });

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (isPinned !== undefined) note.isPinned = isPinned;
        if (isArchived !== undefined) note.isArchived = isArchived;
        if (isTrashed !== undefined) note.isTrashed = isTrashed;
        if (color) note.color = color;
        if (attachmentUrl !== undefined) note.attachmentUrl = attachmentUrl;

        await note.save();
        return res.json({ error: false, note, message: "Note updated successfully" });
    } catch(err) { next(err); }
})
app.get("/notes",authenticateToken , async(req,res,next) =>{
    try {
        const id = req.user.id;
        const { isArchived, isTrashed, search, sortBy, sortOrder } = req.query;
        const query = { userId: id };

        if (isArchived === 'true') query.isArchived = true;
        if (isTrashed === 'true') query.isTrashed = true;
        if (isArchived !== 'true' && isTrashed !== 'true') {
            query.isArchived = false;
            query.isTrashed = false;
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
                { tags: { $regex: search, $options: "i" } }
            ];
        }

        let sortSettings = {};
        if (sortBy) {
            sortSettings[sortBy] = sortOrder === 'asc' ? 1 : -1;
        } else {
            sortSettings = { isPinned: -1, createdOn: -1 };
        }

        const notes = await Note.find(query).sort(sortSettings);
        return res.json({ error: false, message: "Here is list of your all notes", notes });
    } catch(err) { next(err); }
})
app.delete("/delete/:id" , authenticateToken , async(req,res,next)=>{
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
app.put("/updateIsPin/:id" , authenticateToken , async(req,res,next)=>{
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
app.get("/searchNotes", authenticateToken, async (req, res,next) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ error: true, message: "Search query is required" });

        const notes = await Note.find({
            userId: req.user.id,
            title: { $regex: query, $options: "i" }
        });
        return res.json({ error: false, notes, message: "Notes fetched successfully" });
    } catch(err) { next(err); }
});
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
module.exports = app