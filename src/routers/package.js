const express = require("express");
const Package = require("../models/package");
const auth = require("../middlewares/vendorAuth");
const multer = require("multer");
const router = express.Router();
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/vendor/packageimages");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + ".jpg");
  },
});

// const storage = multer.diskStorage({
//   destination: "images/vendor/packageimages",
//   filename: function (req, file, cb) {
//     cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
//   },
// });

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
});

// create package route
router.post(
  "/package",
  auth,
  upload.array("packageimages", 3),
  async (req, res) => {
    const paths = req.files.map((file) => {
      console.log(file, "1231231132");
      return file.path;
    });

    // upload(req, res, (err) => {
    //   console.log("Request ---", req.body);
    //   console.log("Request file ---", req.file)

    try {
      if (req.vendor.accountStatus === "approved") {
        let package;
        if (req.vendor.businessType == "trip planner") {
          package = new Package({
            ...req.body,
            type: "trip",
            packageStatus: "pending",
            creator: req.vendor._id,
          });
        } else if (req.vendor.businessType == "rental services") {
          package = new Package({
            ...req.body,
            type: "rental",
            packageStatus: "pending",
            creator: req.vendor._id,
          });
        } else if (req.vendor.businessType == "hotel provider") {
          package = new Package({
            ...req.body,
            type: "hotel",
            packageStatus: "pending",
            creator: req.vendor._id,
          });
        }
        await package.generateImagesLinks(paths);
        await package.save();
        res.status(200).send(package);
      } else {
        res.status(404).send({ msg: "Vendor account status is pending" });
      }
    } catch (e) {
      res.status(400).send();
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

// Modify package route
router.patch("/package/update/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  console.log(req.body);
  const allowedUpdates = ["packageName", "description", "price", "location"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(404).send({ error: "Invalid updates" });
  }

  try {
    const package = await Package.findById(req.params.id);
    //console.log(package);
    if (!package) {
      return res.status(404).send({ error: "Package id does not exist " });
    } else {
      if (package.creator == req.vendor.id) {
        console.log("matched on update");
        // console.log(updates);
        updates.forEach((update) => {
          package[update] = req.body[update];
          console.log(update);
        });
      }

      // console.log(package);
      await package.updateOne(package);
      res.send(package);
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

// Delete Package of vendor
router.delete("/package/delete/:id", auth, async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    try {
      package.images.forEach((img) => {
        img.imagelink;
        fs.unlinkSync(img.imagelink);
      });
    } catch (e) {
      res.send(e);
    }
    await package.remove();
    if (!package) {
      res.status(404).send();
    }
    res.status(200).send({ msg: "Package deleted Successfully" });
  } catch (e) {
    res.status(400).send(e);
  }
});

// fetch vendor packages
router.get("/packages", auth, async (req, res) => {
  try {
    await req.vendor.populate("packages").execPopulate();
    res.send(req.vendor.packages);
  } catch (e) {
    res.send(500).send();
  }
});

// fetch tour packages
// ?limit=2&skip=2
router.get("/tourpackages", async (req, res) => {
  try {
    const packages = await Package.find({ type: "trip" })
      .skip(parseInt(req.query.skip))
      .limit(parseInt(req.query.limit));
    res.send(packages);
  } catch (e) {
    res.send(500).send();
  }
});

// fetch hotel packages
// ?limit=2&skip=2
router.get("/hotelpackages", async (req, res) => {
  try {
    const packages = await Package.find({ type: "hotel" })
      .skip(parseInt(req.query.skip))
      .limit(parseInt(req.query.limit));
    res.send(packages);
  } catch (e) {
    res.send(500).send();
  }
});

// fetch rental packages
// ?limit=2&skip=2
router.get("/rentalpackages", async (req, res) => {
  try {
    const packages = await Package.find({ type: "rental" })
      .skip(parseInt(req.query.skip))
      .limit(parseInt(req.query.limit));
    res.send(packages);
  } catch (e) {
    res.send(500).send();
  }
});

// fetch by package id
router.get("/package/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const package = await Package.findOne({ _id, creator: req.vendor._id });
    if (!package) {
      return res.status(404).send();
    }
    res.send(package);
  } catch (e) {
    res.status(500).send();
  }
});

// fetch all packages whose packageStatus is pending
// ?limit=2&skip=2

router.get("/package-requests", async (req, res) => {
  try {
    let packages = await Package.find({ packageStatus: "pending" })
      .skip(parseInt(req.query.skip))
      .limit(parseInt(req.query.limit));
    res.send(packages);
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;
