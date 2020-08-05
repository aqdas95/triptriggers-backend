const express = require('express')
const Admin = require('../models/admin')
const auth = require('../middlewares/adminAuth')
const router = new express.Router()
const Vendor = require('../models/vendor')
const Package = require('../models/package') 
const multer = require('multer')
const fs = require('fs')


var storage = multer.diskStorage({
  
  destination: (req, file, cb)=>{
    cb(null, 'images/admin')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname +'-'+ Date.now()+'.jpg')
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

// admin registration route
router.post('/admin', upload.single('avatar') ,async (req, res)=>{

  let admin
  if(req.file){
    admin = new Admin({
      ...req.body,
      imagelink: req.file.path
    })
  }else{
    admin = new Admin({
      ...req.body
    })
  }

  try{
    await admin.save()
    const token = await admin.generateAuthToken()
    res.status(200).send({admin, token})
  }catch(e){
    res.status(400).send(e)
  }
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

//admin login route 
router.post('/admin/login', async(req, res)=>{
  try{
    const admin = await Admin.findByCredentials(req.body.email, req.body.password)
    const token = await admin.generateAuthToken()
    res.send({admin, token})
  }catch(e){
    res.status(400).send({error: "Invalid Email or Password!"})
  }
})

// admin profile route
router.get('/admin/me',auth, async (req, res)=>{
  res.send(req.admin)
})

//Edit admin route
router.patch('/admin/me/edit',upload.single('avatar'), auth, async(req, res)=>{
  if(req.file){
    req.body = {
      ...req.body,
      imagelink:req.file.path
    }
  }else{
    req.body = req.body
  }
  const updates = Object.keys(req.body)
  const allowedUpdates =['username', 'password', 'email', 'contact', 'imagelink']
  const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
  if(!isValidOperation){
    return res.status(404).send({error: 'Invalid updates' })
  }
  try{

    const admin = req.admin
    updates.forEach((update)=>{
      if(update === 'imagelink'){
        try{
          fs.unlinkSync(admin.imagelink)
          // console.log("Image deleted successfully")
        }catch(err){
          console.log("Error while delete existing file"+err)
        }
      }
      admin[update] = req.body[update]
    })
   

    if(!admin){
      res.status(404).send()
    }
   
    await admin.save()
    res.send(admin)
  }catch(e){
    res.status(400).send(e)
  }

})

// admin logout route
router.post('/admin/logout', auth, async(req, res)=>{
  try{
    req.admin.tokens = req.admin.tokens.filter((token)=>{
      return token.token !== req.token
    })
    await req.admin.save()
    res.send('Logout Successfully')

  }catch(e){
    res.status(501).send()
  }
})

// admin logout all session
router.post('/admin/logoutAll', auth, async(req, res)=>{
  try{
    req.admin.token = []
    await req.admin.save()
    res.send('Logout all Session Successfully')
  }
  catch(e){
    res.status(501).send()
  }
})

// approve Vendors accountStatus
router.post('/admin/accept/:id', auth , async(req, res)=>{
  const _id = req.params.id
  try{
    const vendor = await Vendor.findOne({_id})
    vendor.accountStatus = 'approved'
    await vendor.save()
    res.send(vendor)
  }catch(e){
    res.status(400).send(e)
  }
})

// reject Vendors accountStatus
router.post('/admin/reject/:id', auth , async(req, res)=>{
  const _id = req.params.id
  try{
    const vendor = await Vendor.findOne({_id})
    vendor.accountStatus = 'rejected'
    await vendor.save()
    res.send(vendor)
  }catch(e){
    res.status(400).send(e)
  }
})

// approve package accountStatus
router.post('/package/accept/:id', auth, async(req, res)=>{
  try{
    const package = await Package.findById(req.params.id)
    package.packageStatus = 'accepted'
    await package.save()
    res.send(package)
  }catch(e){
    res.status(400).send(e)
  }
})

// reject package accountStatus
router.post('/package/reject/:id', auth, async(req, res)=>{
  try{
    const package = await Package.findById(req.params.id)
    package.packageStatus = 'rejected'
    await package.save()
    res.send(package)
  }catch(e){
    res.status(400).send(e)
  }
})

module.exports = router