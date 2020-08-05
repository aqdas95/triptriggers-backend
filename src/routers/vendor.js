const express = require("express");
const Vendor = require("../models/vendor");
const auth = require("../middlewares/vendorAuth");
const adminAuth = require("../middlewares/adminAuth");
const multer = require("multer");
const fs = require("fs");
const router = new express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/vendor/vendorimage");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + ".jpg");
  },
});

const upload = multer({
  limits: {
    fileSize: 5000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
  storage: storage,
});

// vendor registration route
router.post(
  "/vendor",
  upload.array("imagelink", 3),
  async (req, res) => {
    const paths = req.files.map((file) => {
      console.log(file, "1231231132");
      return file.path;
    });
    let vendor;
    if (req.file) {
      vendor = new Vendor({
        ...req.body,
        accountStatus: "pending",
        // imagelink: paths,
      });
    } else {
      vendor = new Vendor({
        ...req.body,
        accountStatus: "pending",
      });
    }

    try {
      await vendor.generateImagesLinks(paths);
      await vendor.save();
      const token = await vendor.generateAuthToken();
      res.status(200).send({ vendor, token });
    } catch (e) {
      res.status(400).send(e);
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//vendor update route
router.patch(
  "/vendor/me/update",
  upload.single("avatar"),
  auth,
  async (req, res) => {
    if (req.file) {
      req.body = {
        ...req.body,
        imagelink: req.file.path,
      };
    } else {
      req.body = req.body;
    }
    console.log(req.body);
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "vendorName",
      "email",
      "contactNumber",
      "password",
      "username",
      "cnic",
      "gender",
      "dob",
      "city",
      "officeAddress",
      "description",
      "businessType",
      "fbLink",
      "instaLink",
      "websiteLink",
      "imagelink",
    ];

    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
      return res.send(404).send({ error: "Invalid updates" });
    }

    try {
      const vendor = req.vendor;
      updates.forEach((update) => {
        if (update === "imagelink") {
          try {
            fs.unlinkSync(vendor.images[0].imagelink);
            vendor.images[0].imagelink = req.body[update];
            // console.log("Image deleted successfully")
          } catch (err) {
            console.log("Error while delete existing file" + err);
          }
        } else {
          vendor[update] = req.body[update];
        }
      });

      if (!vendor) {
        res.status(404).send();
      }

      await vendor.save();
      res.send(vendor);
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }
  }
);

//vendor delete route
//route commented bcz vendor cant delete their own acccount but contact the admin to delete it
router.delete("/vendor-delete/:id", adminAuth, async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  // console.log(vendor)

  if (!vendor) {
    res.status(404).send();
  }
  try {
    try {
      // const path = vendor.imagelink
      fs.unlinkSync(vendor.imagelink);
      // console.log("Image deleted successfully")
    } catch (err) {
      console.log("Error while delete existing file" + err);
    }
    await vendor.remove();
    res.status(200).send({ msg: "You are deleted Successfully" });
  } catch (e) {
    res.status(400).send(e);
  }
});

//vendor login route
router.post("/vendor/login", async (req, res) => {
  try {
    const vendor = await Vendor.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await vendor.generateAuthToken();
    res.send({ vendor, token });
  } catch (e) {
    res.status(400).send();
  }
});

// vendor profile
router.get("/vendor/me", auth, async (req, res) => {
  res.send(req.vendor);
});

// vendor logout
router.post("/vendor/logout", auth, async (req, res) => {
  try {
    req.vendor.tokens = req.vendor.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.vendor.save();
    res.send({ msg: "Logout Successfully" });
  } catch (e) {
    res.status(500).send();
  }
});

// vendor logout all session
router.post("/vendor/logoutAll", auth, async (req, res) => {
  try {
    req.vendor.tokens = [];
    await req.vendor.save();
    res.send({ msg: "Logout all session successfully" });
  } catch (e) {
    res.status(500).send();
  }
});

// All the vendors whose accountStatus are pending
// ?limit=2&skip=2

router.get("/vendor-requests", async (req, res) => {
  try {
    const vendor = await Vendor.find({ accountStatus: "pending" })
      .skip(parseInt(req.query.skip))
      .limit(parseInt(req.query.limit));
    res.send(vendor);
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;
