const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
  comment: {
    type: String,
    require: true,
    trim: true
  },
  like: {
    type: Boolean,
    require: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'Customer'
  },
  reference: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'Package'
  }
})

const Feedback = mongoose.model('Feedback', feedbackSchema)

module.exports = Feedback