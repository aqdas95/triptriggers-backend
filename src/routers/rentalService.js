const express = require("express");
const RentalService = require("../models/rentalService");
const Package = require("../models/package");
const auth = require("../middlewares/vendorAuth");

const router = new express.Router();

// create rentalservices route
router.post("/package/rentalServices/:id", auth, async (req, res) => {
  const obj = await Package.findById(req.params.id);
  if (obj !== null) {
    var rentalService = new RentalService({
      ...req.body,
      package: req.params.id,
    });
  }
  try {
    await rentalService.save();
    res.status(200).send(rentalService);
  } catch (e) {
    res.status(400).send({ msg: "package id not exist" });
  }
});

//modify rental service route
router.patch("/package/rentalServices/update/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "vehicleRegNo",
    "driverName",
    "driverContact",
    "vehicleType",
    "vehicleName",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(404).send({ error: "Invalid updates" });
  }

  try {
    console.log(req.params.id);
    const rentalService = await RentalService.findOne({
      package: req.params.id,
    });
    console.log(rentalService, "qweqwe");
    if (!rentalService) {
      return res.status(404).send({ error: "Package Service does not exist " });
    } else {
      if (rentalService.package == req.params.id) {
        console.log("matched");
        updates.forEach((update) => {
          rentalService[update] = req.body[update];
        });
      }
      await rentalService.updateOne(rentalService);
      res.send(rentalService);
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

//get any sub part rental package by package id
router.get("/rentalpackage/:id", async (req, res) => {
  try {
    const rentalPackage = await RentalService.findOne({
      package: req.params.id,
    });
    res.status(200).send(rentalPackage);
  } catch (e) {
    res.status(400).send(e);
  }
});

// There will no delete route for services but only whole package can be delete
module.exports = router;
