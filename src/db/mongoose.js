const mongoose = require('mongoose')
const db = require('./config')
mongoose.connect( db.mongoURI , {
useNewUrlParser: true,
useCreateIndex: true,
useFindAndModify: false,
useUnifiedTopology: true
}).then(console.log(`MongoDB is connected at ${db.mongoURI}`))