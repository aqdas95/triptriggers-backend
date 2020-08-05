const mongoose = require('mongoose')
const validator = require('validator')

const hotelServiceSchema = new mongoose.Schema({

  managerName: {
    type: String,
    require: true,
    trim: true
  },
  managerContact: {
    type: String,
    require: true,
    validate(value){
      if(!validator.isMobilePhone(value,'en-PK')){
        throw new Error("Phone number is invalid")
      }
    }
  },
  roomQuality : {
    type: String,
    require: true 
  },
  roomType: {
    type: String,
    require: true
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'Package'
  }
})

const HotelService = mongoose.model('HotelService', hotelServiceSchema)
module.exports = HotelService