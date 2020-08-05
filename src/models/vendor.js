const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Package = require("./package");
const RentalService = require("./rentalService");
const TourService = require("./tourService");
const HotelService = require("./hotelService");
const fs = require("fs");

const vendorSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    require: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isAlpha(value)) {
        throw new Error("Only letters can be use");
      } else if (value.length > 20) {
        throw new Error("Field must not contain more than 20 character");
      }
    },
  },
  email: {
    type: String,
    unique: true,
    require: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  contactNumber: {
    type: String,
    require: true,
    validate(value) {
      if (!validator.isMobilePhone(value, "en-PK")) {
        throw new Error("Phone number is invalid ");
      }
    },
  },
  password: {
    type: String,
    require: true,
    trim: true,
    validate(value) {
      if (value.length < 8) {
        throw new Error("Password length must be 8 characters");
      }
    },
  },
  username: {
    type: String,
    require: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isAlphanumeric(value)) {
        throw new Error("Username must be Alphanumeric");
      } else if (value.length < 8) {
        throw new Error("Username length must be 8 character or more");
      }
    },
  },
  cnic: {
    type: String,
    require: true,
    trim: true,
    validate(value) {
      if (value.length == 11) {
        throw new Error("Please enter correct CNIC");
      }
    },
  },
  gender: {
    type: String,
    require: true,
    trim: true,
  },
  dob: {
    type: Date,
    require: true,
  },
  city: {
    type: String,
    require: true,
    trim: true,
  },
  officeAddress: {
    type: String,
    require: true,
    trim: true,
  },
  description: {
    type: String,
    require: true,
    trim: true,
    validate(value) {
      if (value.length > 200) {
        throw new Error("Description length not be greater than 200 character");
      }
    },
  },
  businessType: {
    type: String,
    require: true,
    trim: true,
  },
  fbLink: {
    type: String,
    trim: true,
  },
  instaLink: {
    type: String,
    trim: true,
  },
  websiteLink: {
    type: String,
    trim: true,
  },
  accountStatus: {
    type: String,
    require: true,
  },
  images: [
    {
      imagelink: {
        type: String,
        require: true,
      },
    },
  ],
  tokens: [
    {
      token: {
        type: String,
        require: true,
      },
    },
  ],
});

vendorSchema.virtual("packages", {
  ref: "Package",
  localField: "_id",
  foreignField: "creator",
});

// Generate authorization token
vendorSchema.methods.generateAuthToken = async function () {
  const vendor = this;
  const token = jwt.sign({ _id: vendor._id.toString() }, "triptriggers");
  vendor.tokens = vendor.tokens.concat({ token });
  await vendor.save();
  return token;
};

vendorSchema.methods.generateImagesLinks = async function (paths) {
  const vendor = this;

  for (let index = 0; index < paths.length; index++) {
    const imagelink = paths[index];
    vendor.images = vendor.images.concat({ imagelink });
    console.log(vendor.images);
  }

  return vendor.images;
};

//login credential method
vendorSchema.statics.findByCredentials = async (email, password) => {
  const vendor = await Vendor.findOne({ email });
  if (!vendor) {
    throw new console.Error("Email is invalid");
  }

  const isMatch = await bcrypt.compare(password, vendor.password);
  if (!isMatch) {
    throw new Error("Passwor is invalid");
  }

  return vendor;
};

//middleware to hash the password
vendorSchema.pre("save", async function (next) {
  const vendor = this;
  if (vendor.isModified("password")) {
    vendor.password = await bcrypt.hash(vendor.password, 8);
  }
  next();
});

//middle to remove packages of vendors before removing the actual vendor
vendorSchema.pre("remove", async function (next) {
  const vendor = this;
  console.log("before deleting");
  const packages = await Package.find({ creator: vendor._id });
  packages.forEach((package) => {
    try {
      package.images.forEach((img) => {
        img.imagelink;
        fs.unlinkSync(img.imagelink);
      });

      RentalService.deleteMany({ package: package.id });
      TourService.deleteMany({ package: package.id });
      HotelService.deleteMany({ package: package.id });

      package.remove();
      // console.log("Image deleted successfully")
    } catch (err) {
      console.log("Error while delete existing file" + err);
    }
  });

  // await Package.deleteMany({creator: vendor._id})
  //but package images is not deleting

  next();
});

const Vendor = mongoose.model("Vendor", vendorSchema);
module.exports = Vendor;
