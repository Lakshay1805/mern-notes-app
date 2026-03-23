require("dotenv").config();
const mongoose = require("mongoose")
const Schema = mongoose.Schema

main()
.then(console.log("DB connected"))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.DB_ATLAS);
}
const userSchema = new Schema({
    fullName:{type:String},
    email:{type:String},
    password:{type:String},
    refreshToken:{type:String},
    createdOn:{
        type:Date,
        default: new Date().getTime(),
    },
});
module.exports = mongoose.model("User" , userSchema);