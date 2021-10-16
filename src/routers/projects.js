const express = require("express");
const Project = require("../models/projects");
const User = require("../models/user");

const router = new express.Router();
const auth = require("../middleware/auth");
const { findByIdAndUpdate } = require("../models/projects");

router.post("/project", auth, async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      contributors: [{ id: req.user.id, name: req.user.name }],
      owner: req.user.id,
    });
    await project.save();
    res.status(201).send({ project });
  } catch (error) {
    console.log("error in " + req.url, error);
    res.status(500).send(error);
  }
});

router.get("/project/:id", auth, async (req, res) => {
  try {
    const project = await Project.find({
      _id: req.params.id,
    });
    res.status(200).send({ project });
  } catch (error) {
    console.log("error at " + req.url, error);
    res.status(500).send(error);
  }
});

router.get("/projects", auth, async (req, res) => {
  try {
    const projects = await Project.find({ "contributors.id": req.user.id });
    res.json({ projects });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put("/project/contributor/:id", auth, async (req, res) => {
  try {
    const user = await User.find({ email: req.body.email });

    if (!user[0]) {
      return res.status(404).send({ message: "User not found" });
    }

    const proj = await Project.find({ _id: req.params.id });

    proj[0].contributors.push({ id: user[0]._id, name: user[0].name });
    delete proj[0]._id;

    const project = await Project.findByIdAndUpdate(req.params.id, proj[0], {
      new: true,
    });
    res.status(201).send({ project });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

module.exports = router;
