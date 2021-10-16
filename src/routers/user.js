const express = require("express");
const User = require("../models/user");

const router = new express.Router();
const auth = require("../middleware/auth");

router.post("/user/signup", async (req, res) => {
  const user = new User({ ...req.body });
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).json({ user: await user.getPublicProfile(), token });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.post("/user/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.json({ user: await user.getPublicProfile(), token });
  } catch (e) {
    res.status(404).send();
  }
});

router.get("/users/getAll", auth, async (req, res) => {
  try {
    const users = await User.find({});
    let data = users.map(({ name, _id }) => ({ name, _id }));
    res.json({ users: data });
  } catch (e) {
    res.status(404).send();
  }
});

//update user
router.put("/user/me", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "name",
      "password",
      "email",
      "profilePic",
      "address",
    ];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ error: "Invalid Updates" });
    }

    const user = req.user;

    updates.forEach((update) => (user[update] = req.body[update]));

    await user.save();

    if (!user) return res.status(404).send();
    res.json({ user: await user.getPublicProfile() });
  } catch (e) {
    res.status(500).send(e);
  }
});

//delete user
router.delete("/user/me", auth, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.user._id });
    res.json({ user: await user.getPublicProfile() });
  } catch (e) {
    res.status(500).send();
  }
});

//logout All
router.post("/user/logout", auth, async (req, res) => {
  try {
    const user = req.user;
    user.tokens = [];
    await user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
