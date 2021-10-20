const express = require("express");
const Bug = require("../models/bugs");
const mongoose = require("mongoose");

const router = new express.Router();
const auth = require("../middleware/auth");
const User = require("../models/user");

router.get("/get/bugs", auth, async (req, res) => {
  try {
    const bugs = await Bug.find({
      contributors: { $elemMatch: { name: req.user.name } },
    }).sort({ createdAt: -1 });
    res.json({ bugs });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/bug/:id", auth, async (req, res) => {
  try {
    const projectId = mongoose.Types.ObjectId(req.params.id);
    const bugs = await Bug.find({
      in: projectId,
    });
    res.json({ bugs });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

router.post("/bug", auth, async (req, res) => {
  const bug = new Bug({
    ...req.body,
    createdBy: req.user.id,
  });

  try {
    await bug.save();
    res.status(201).json({ bug });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.put("/update/bug/:id", auth, async (req, res) => {
  try {
    const bug = await Bug.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    const tasks = await Task.find({ owner: bug._id });
    let temp = req.body.contributors.map((user) => user._id);
    tasks.forEach(async (task) => {
      task.contributors = task.contributors.filter((user) =>
        temp.includes(user._id)
      );
      await task.save();
    });
    res.json({ bug });
  } catch (e) {
    res.status(404).send();
  }
});

router.put("/bug/contributor/:id", auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $in: req.body.ids } });

    if (!users[0]) {
      return res.status(404).send({ message: "User not found" });
    }

    const bug = await Bug.find({ _id: req.params.id });

    users.forEach((user) => {
      bug[0].contributors.push({ id: user._id, name: user.name });
    });
    delete bug[0]._id;

    const updated = await Bug.findByIdAndUpdate(req.params.id, bug[0], {
      new: true,
    });
    res.status(201).send({ bug: updated });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

router.put("/bug/contributor/remove/:id", auth, async (req, res) => {
  try {
    const bugs = await Bug.find({ _id: req.params.id });

    bugs[0].contributors = bugs[0].contributors.filter((user) => {
      const userId = user.id.toString();
      return userId !== req.body.userId;
    });
    delete bugs[0]._id;

    const bug = await Bug.findByIdAndUpdate(req.params.id, bugs[0], {
      new: true,
    });
    res.status(201).send({ bug });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

router.delete("/bug/delete/:id", auth, async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug || bug.owner.toString() !== req.user._id.toString()) {
      throw new Error("Something went wrong");
    }
    await Bug.findByIdAndDelete(req.params.id);
    res.json(bug);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
