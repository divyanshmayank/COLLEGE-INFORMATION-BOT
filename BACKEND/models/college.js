const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    fee: {
      type: String,
      default: "Programme-specific",
    },
  },
  {
    _id: false,
  }
);

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    shortName: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    courses: {
      type: [courseSchema],
      default: [],
    },

    admissions: {
      type: String,
      default: "",
    },

    placement: {
      type: String,
      default: "",
    },

    facilities: {
      type: [String],
      default: [],
    },

    website: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("College", collegeSchema);