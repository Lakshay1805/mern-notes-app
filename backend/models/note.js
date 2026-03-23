const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const User = require("./user.js")

const noteSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    tags:{
        type:[String],
        default:[]
    },
    isPinned:{
        type:Boolean,
        default:false
    },
    isArchived:{
        type:Boolean,
        default:false
    },
    isTrashed:{
        type:Boolean,
        default:false
    },
    color:{
        type:String,
        default:"white"
    },
    attachmentUrl:{
        type:String,
        default:null
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    createdOn:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Note" , noteSchema);