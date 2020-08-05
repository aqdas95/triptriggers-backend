const express = require('express')
const Customer = require('../models/customer')
const auth = require('../middlewares/customerAuth')
const multer = require('multer')
const fs = require('fs')

const router = new express.Router()

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/customer')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname  + '-' + Date.now()+'.jpg')
  }
});
var upload = multer({
  limits: {
    fileSize: 5000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Please upload an image'))
    }

    cb(undefined, true)
  },
  storage: storage,
  
});

// customer registration route
router.post('/customer', upload.single('avatar') ,async (req, res)=>{
  let customer
  if(req.file){
      customer = new Customer({ 
      ...req.body, 
      imagelink:req.file.path

    })
  }else{
    customer = new Customer({ 
      ...req.body
    })
  }
  try{
    await customer.save()
    const token = await customer.generateAuthToken()
    res.status(201).send({customer, token})
  }catch(e){
    res.status(400).send(e)
  }
}, (error, req, res, next)=>{
    res.status(400).send({error: error.message})
})

//customer update route
router.patch('/customer/me/update', upload.single('avatar'), auth, async(req,res)=>{
  if(req.file){
    req.body = {
      ...req.body,
      imagelink:req.file.path
    }
  }else{
    req.body = req.body
  }
  const updates = Object.keys(req.body)
  const allowedUpdates = ['customerName', 'email', 'contactNumber', 'password',
  'cnic', 'gender', 'dob', 'city', 'imagelink' ]

  const isValidOperation = updates.every((update)=> allowedUpdates.includes(update) )
  if(!isValidOperation){
    return res.send(404).send({error: 'Invalid updates'})
  }

  try{

    const customer = req.customer
    updates.forEach((update)=>{
      if(update === 'imagelink'){
        try{
          fs.unlinkSync(customer.imagelink)
          // console.log("Image deleted successfully")
        }catch(err){
          console.log("Error while delete existing file"+err)
        }
      }
      customer[update] = req.body[update]
    })
   

    if(!customer){
      res.status(404).send()
    }
   
    await customer.save()
    res.send(customer)
  }catch(e){
    res.status(400).send(e)
  }

})

//customer delete route
router.delete('/customer/me/delete', auth, async(req, res)=>{
  
  try{
    try{
      fs.unlinkSync(req.customer.imagelink)
      // console.log("Image deleted successfully")
    }catch(err){
      console.log("Error while delete existing file"+err)
    }
    const customer = await Customer.findByIdAndDelete(req.customer._id)
    if(!customer){
      res.status(404).send()
    }
    res.status(200).send({ msg: 'You are deleted Successfully'})
  }catch(e){
    res.status(400).send(e)
  }
})


// customer login route
router.post('/customer/login', async (req, res)=>{
  try{
    const customer = await Customer.findByCredentials(req.body.email, req.body.password)
    const token = await customer.generateAuthToken()
    res.send({customer, token})

  }catch(e){
    res.status(400).send()
  }
})

// customer profile route
router.get('/customer/me', auth, async (req, res) => {
  res.send(req.customer)
})

// customer logout route
router.post('/customer/logout', auth, async(req, res) => {
  try{
    req.customer.tokens = req.customer.tokens.filter((token)=>{
      return token.token !== req.token
    })
    await req.customer.save()
    res.send('Logout Successfully') 

  }catch(e){
    res.status(500).send()
  }
})

// customer logout all session
router.post('/customer/logoutAll', auth, async (req, res)=>{
  try{
    req.customer.tokens = []
    await req.customer.save()
    res.send('Logout all session')

  }catch(e){
    res.status(500).send()
  }
})
module.exports = router