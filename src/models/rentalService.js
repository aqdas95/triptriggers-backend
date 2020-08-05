const mongoose = require('mongoose')
const validator = require('validator')

const rentalServiceSchema = new mongoose.Schema({
  vehicleRegNo: {
    type: String,
    require: true,
    trim: true
  },
  driverName: {
    type: String,
    require: true,
    trim: true
  },
  driverContact: {
    type: String,
    require: true,
    validate(value){
      if(!validator.isMobilePhone(value,'en-PK')){
        throw new Error("Phone number is invalid")
      }
    }
  },
  vehicleType: {
    type: String,
    require: true
  },
  vehicleName: {
    type: String,
    require: true,
    trim: true
  },
  package: {
    type: mongoose.Schema.Types
    .ObjectId,
    require: true,
    ref: 'Package'
  }
})

const RentalService = mongoose.model('RentalService', rentalServiceSchema)

module.exports = RentalService