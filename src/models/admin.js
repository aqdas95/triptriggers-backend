const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    trim: true,
    lowercase: true,
    validate(value){
      if(!validator.isAlphanumeric(value)){
        throw new Error("Username must be Alphanumeric")
      }else if(value.length<8){
        throw new Error("Username length must be 8 character or more")
      }
    }
  },
  password: {
    type: String,
    require: true,
    trim: true,
    validate(value){
      if(value.length<8){
        throw new Error("Password length must be 8 characters")
      }
    }
  },
  email: {
    type: String,
    require: true,
    trim: true,
    unique: true,
    lowercase: true,
    validate(value){
      if(!validator.isEmail(value)){
        throw new Error("Email is invalid")
      }
    }
  },
  contact: {
    type: String,
    require: true,
    validate(value){
      if(!validator.isMobilePhone(value,'en-PK')){
        throw new Error("Phone number is invalid")
      }
    } 
  },
  imagelink: {
    type: String,
    require: true
  },
  tokens: [{
    token: {
      type: String,
      require: true
    }
  }]
})

// generating authorization token
adminSchema.methods.generateAuthToken = async function(){
  const admin = this
  const token = await jwt.sign({_id: admin._id.toString()}, 'triptriggers')
  admin.tokens = admin.tokens.concat({token})
  await admin.save()
 return token

}

//login credential checking
adminSchema.statics.findByCredentials = async (email, password)=>{

  const admin = await Admin.findOne({email})
  if(!admin){
    throw new Error("Email is invalid")
  }  

 
  const isMatch = await bcrypt.compare(password, admin.password)

  if(!isMatch){
    throw new Error('Invalid Password')
  }

  return admin

}

//middleware funtion
adminSchema.pre('save', async function(next){
  const admin = this
  
  if(admin.isModified('password')){
    admin.password = await bcrypt.hash(admin.password, 8)  
  }
 
  next()
})

const Admin = mongoose.model('Admin', adminSchema)

module.exports = Admin