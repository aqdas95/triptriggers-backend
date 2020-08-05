const express = require("express");
const TourService = require("../models/tourService");
const Package = require("../models/package");
const auth = require("../middlewares/vendorAuth");

const router = new express.Router();

// create tour service route
router.post("/package/tourService/:id", auth, async (req, res) => {
  const obj = await Package.findById(req.params.id);
  if (obj !== null) {
    var tourService = new TourService({
      ...req.body,
      package: req.params.id,
    });
  }
  try {
    await tourService.save();
    res.status(200).send(tourService);
  } catch (e) {
    res.status(400).send({ msg: "package id not exist" });
  }
});

//modify tour service route
router.patch("/package/tourService/update/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "guiderName",
    "guiderContact",
    "startDate",
    "endDate",
    "food",
    "accomodation",
    "traveling",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(404).send({ error: "Invalid updates" });
  }

  try {
    const tourService = await TourService.findOne({
      package: req.params.id,
    });
    console.log(tourService);
    if (!tourService) {
      return res.status(404).send({ error: "Package Service does not exist " });
    } else {
      if (tourService.package == req.params.id) {
        console.log("matched");
        updates.forEach((update) => {
          tourService[update] = req.body[update];
        });
      }
      await tourService.updateOne(tourService);
      res.send(tourService);
    }
  } catch (e) {
    res.status(400).send(e);
  }
});
//get any sub part tour package by package id
router.get("/tourpackage/:id", async (req, res) => {
  try {
    const tourPackage = await TourService.findOne({ package: req.params.id });
    res.status(200).send(tourPackage);
  } catch (e) {
    res.status(400).send(e);
  }
});

// There will no delete route for services but only whole package can be delete

module.exports = router;
