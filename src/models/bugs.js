const mongoose = require("mongoose");

const bugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    identifier: {
      type: String,
    },
    url: {
      type: String,
      required: true,
    },
    contributors: {
      type: Array,
    },
    in: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Project",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Bug = mongoose.model("Bug", bugSchema);

module.exports = Bug;
