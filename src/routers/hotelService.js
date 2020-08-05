const express = require("express");
const HotelService = require("../models/hotelService");
const Package = require("../models/package");
const auth = require("../middlewares/vendorAuth");

const router = new express.Router();

// create tour service route
router.post("/package/hotelServices/:id", auth, async (req, res) => {
  console.log("im in th ");
  const obj = await Package.findById(req.params.id);
  console.log(obj);
  if (obj !== null) {
    var hotelService = new HotelService({
      ...req.body,
      package: req.params.id,
    });
  }
  console.log(hotelService);
  try {
    await hotelService.save();
    res.status(200).send(hotelService);
  } catch (e) {
    res.status(400).send({ msg: "package id not exist" });
  }
});

//modify hotel service route
router.patch("/package/hotelServices/update/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "managerName",
    "managerContact",
    "roomQuality",
    "roomType",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(404).send({ error: "Invalid updates" });
  }

  try {
    const hotelService = await HotelService.findOne({ package: req.params.id });
    console.log(hotelService);
    if (!hotelService) {
      return res.status(404).send({ error: "Package Service does not exist " });
    } else {
      if (hotelService.package == req.params.id) {
        console.log("matched");
        updates.forEach((update) => {
          hotelService[update] = req.body[update];
        });
      }
      await hotelService.updateOne(hotelService);
      res.send(hotelService);
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

//get any sub part hotel package by package id
router.get("/hotelpackage/:id", async (req, res) => {
  try {
    const hotelPackage = await HotelService.findOne({ package: req.params.id });
    res.status(200).send(hotelPackage);
  } catch (e) {
    res.status(400).send(e);
  }
});

// There will no delete route for services but only whole package can be delete

module.exports = router;
