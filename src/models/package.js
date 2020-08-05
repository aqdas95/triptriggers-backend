const mongoose = require('mongoose')
const validator = require('validator')
const RentalServices = require('./rentalService')
const TourServices = require('./tourService')
const HotelServices = require('./hotelService')

const packageSchema = new mongoose.Schema({
  packageName: {
    type: String,
    trim: true,
    require: true
  },
  description:{
    type: String,
    trim: true,
    require: true
  },
  price: {
    type: Number,
    require: true
  },
  images: [{
    imagelink: {
      type: String,
      require: true
    }
  }],
  location: {
    type: String,
    require: true,
    trim: true 
  },
  packageStatus: {
    type: String,
    require: true
  },
  type: {
    type: String,
    require: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'Vendor'
  }
})

packageSchema.virtual('feedback', {
  ref: 'Feedback',
  localField: '_id',
  foreignField: 'reference'
})

packageSchema.virtual('rentalServices',{
  ref: 'RentalService',
  localField: '_id',
  foreignField: 'package'
})

packageSchema.virtual('hotelServices',{
  ref: 'HotelService',
  localField: '_id',
  foreignField: 'package'
})

packageSchema.virtual('tourServices',{
  ref: 'TourService',
  localField: '_id',
  foreignField: 'package'
})

// save images link in image array
packageSchema.methods.generateImagesLinks = async function(paths){
  const package = this

  for (let index = 0; index < paths.length; index++) {
    const imagelink =paths[index]
    package.images = package.images.concat({imagelink})
    console.log(package.images)
  }
 
  return package.images 
}

//remove all the sub package details before deleting the main package
packageSchema.pre('remove', async function(next){
  const package = this
  console.log('Before removing the package')
  await RentalServices.deleteMany({package: package._id})
  await TourServices.deleteMany({package: package._id})
  await HotelServices.deleteMany({package: package._id})
  next()
})


const Package = mongoose.model('Package', packageSchema)
module.exports = Package