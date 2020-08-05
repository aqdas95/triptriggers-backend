const express = require('express')
require('./db/mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')

const customerRouter = require('./routers/customer')
const vendorRouter = require('./routers/vendor')
const adminRouter = require('./routers/admin')
const packageRouter = require('./routers/package')
const feedbackRouter = require('./routers/feedback')
const rentalServiceRouter = require('./routers/rentalService')
const hotelServiceRouter = require('./routers/hotelService')
const tourServiceRouter = require('./routers/tourService')
const app = express()
const port = process.env.PORT || 5000;

// app.use((req, res, next) => {
//   if(req.method == 'POST'){
//     res.send('POST request are disabled')
//   } else {
//     next()
//   }
// })

// app.use((req, res, next) => {
//   res.status(503).send('Site is currently down. Check back soon')
// })

app.use(cors());
app.options('*', cors());

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(customerRouter)
app.use(vendorRouter)
app.use(adminRouter)
app.use(packageRouter)
app.use(feedbackRouter)
app.use(rentalServiceRouter)
app.use(tourServiceRouter)
app.use(hotelServiceRouter)
app.use('/images', express.static('images'))

app.listen(port, ()=>{
  console.log(`Project backend is running on port ${port}`)
})