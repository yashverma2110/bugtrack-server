const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
    },
    base_url: {
      type: String,
      required: true,
    },
    contributors: {
      type: Array,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.virtual("bugs", {
  ref: "Bug",
  localField: "_id",
  foreignField: "in",
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
