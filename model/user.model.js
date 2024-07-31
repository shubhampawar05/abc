import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const UserSchema = new mongoose.Schema({
  firstname : {
    type: String,
    required: true
  },
  googleId : {
    type: String
  }
  ,
  lastname : {
    type : String,
    required: true
  }
  ,
  email : {
    type : String,
    required : true,
    validate : function (){
      return validator.isEmail(this.email);
    },
    unique : true
  }
  ,
  password : {
    type : String,
    // required : true
  }
  ,
  activeStatus : {
    type : Boolean,
    default : false
  }
  ,
  credit : {
    type : Number,
    default : 0
  }
  ,
  username : {
    type : String,
    required : true,
    unique : true
  }
  ,
  deletedAt : {
    type : Date,
    // default: Date.now
  }
  ,
  ModificationTimeline: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      action: {
        type: String,
        enum: ["deleted", "updated", "created"], // Possible actions
        required: true,
      },
    },
  ],
},
{
  timestamps : true
})

UserSchema.pre("save", async function(next){
  if (!this.isModified('password')) return next()

  this.password = await bcrypt.hash(this.password, 10)
  return next()
})

UserSchema.methods.generateAccessToken = async function(userDetails){
 const token = await jwt.sign(userDetails, 'secret', { expiresIn: '1h' });
 return token;
}

UserSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password)
}

const User = new mongoose.model("User",UserSchema);


export default User;