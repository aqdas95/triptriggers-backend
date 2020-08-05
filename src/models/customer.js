const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const customerSchema = new mongoose.Schema({

  customerName: {
     type: String,
     require: true,
     trim: true,
     lowercase: true,
     validate(value){
      if(!validator.isAlpha(value)){
        throw new Error("Only letters can be use")
      }else if(value.length > 20){
         throw new Error("Field must not contain more than 15 character")
       }
     }
  },
  email: {
    type: String,
    unique: true,
    require: true,
    trim: true,
    lowercase: true,
    validate(value){
      if(!validator.isEmail(value)){
        throw new Error("Email is invalid")
      }
    }
  },
  contactNumber: {
    type: String,
    require: true,
    validate(value){
      if(!validator.isMobilePhone(value,'en-PK')){
        throw new Error("Phone number is invalid")
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
  cnic: {
    type: String,
    require: true,
    trim: true,
    validate(value){
      if(value.length == 11){
        throw new Error("Please enter correct CNIC")
      }
    }
  },
  gender: {
    type: String,
    require: true,
    trim: true
  },
  dob: {
    type: Date,
    require: true
  },
  city: {
    type: String,
    require: true,
    trim: true
  },
  imagelink: {
    type: String,
    require: true
  },
  tokens: [{
    token:{
      type: String,
      require: true
    }
  }]

})

customerSchema.virtual('feedback',{
  ref:'Feedback',
  localField: '_id',
  foreignField: 'creator'
})

//Generate Authorization token
customerSchema.methods.generateAuthToken = async function () {
  const customer = this 
  const token = jwt.sign({_id: customer._id.toString()}, 'triptriggers')
  customer.tokens = customer.tokens.concat({ token })
  await customer.save()
  return token 
}


//login credentials checking
customerSchema.statics.findByCredentials = async (email, password) =>{
 
  const customer = await Customer.findOne({ email })
  if(!customer){
    throw new Error("Email is incorrect")
  }
  const isMatch = await bcrypt.compare(password, customer.password)

  if(!isMatch){
    throw new Error("Password is incorrect")
  }
  return customer 
}

//hashing the password
customerSchema.pre('save', async function(next){
  const customer = this
  
  if(customer.isModified('password')){
    customer.password = await bcrypt.hash(customer.password, 8)  
  }
 
  next()
})

const Customer = mongoose.model('Customer', customerSchema )

module.exports = Customer;