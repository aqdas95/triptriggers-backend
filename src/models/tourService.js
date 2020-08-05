const mongoose = require('mongoose')
const validator = require('validator')

const tourServiceSchema = new mongoose.Schema({

  guiderName: {
    type: String,
    require: true
  },
  guiderContact: {
    type: String,
    require: true,
    validate(value){
      if(!validator.isMobilePhone(value,'en-PK')){
        throw new Error("Phone number is invalid")
      }
    }
  },
  startDate: {
    type: Date,
    require: true
  },
  endDate: {
    type: Date,
    require: true
  },
  food: {
    type: Boolean,
    require: true
  },
  accomodation: {
    type: Boolean,
    require: true
  },
  traveling: {
    type: Boolean,
    require: true
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'Package'
  }

})

const TourService = mongoose.model('TourService', tourServiceSchema)

module.exports = TourService