const express = require('express')
const Feedback = require('../models/feedback')
const auth = require('../middlewares/customerAuth')

const router = express.Router()

// feedback create route
// /feedback/pkgId
router.post('/feedback/:id', auth ,async(req, res)=>{

  const feedback = new Feedback({
    ...req.body,
    creator: req.customer._id,
   reference: req.params.id
  })
  try{
    console.log(req.params.id)
    await feedback.save()
    res.status(200).send(feedback)    
  }catch(e){
    res.status(400).send(e)
  }
})

//feedback edit route
// /feedback/feedBackId
router.patch('/feedback/edit/:id', auth ,async(req, res)=>{

  const updates = Object.keys(req.body)
  const allowedUpdates = ['comment', 'like']
  const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))

  if(!isValidOperation){
    return res.status(404).send({error: 'Invalid updates'})
  }

  try{
    const customer = req.customer
    const feedback = await Feedback.findById(req.params.id)

    if(feedback.creator == customer.id){
      
      updates.forEach((update)=>{
        feedback[update]=req.body[update]
      })
    }
    await feedback.save()
    res.status(200).send(feedback)    
  }catch(e){
    res.status(400).send(e)
  }
})

//feedback delete route ?? use edit api while deleting the feedback by passing the empty comment 

// router.delete('/feedback/delete/:id', auth ,async(req, res)=>{
//   try{
//     const customer = req.customer
//     const feedback = await Feedback.findById(req.params.id)

//     if(feedback.creator == customer.id){
     
//       await feedback.remove()
       
//     }
//     await feedback.save()
//     res.status(200).send(feedback)    
//   }catch(e){
//     res.status(400).send(e)
//   }
// })


module.exports = router

