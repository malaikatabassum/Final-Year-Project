const port = 5000;
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

// MongoDB connection for registration (Authentication keys, users)
mongoose.connect("mongodb+srv://tmalaika:malaika1234@user.bkswf.mongodb.net/?retryWrites=true&w=majority&appName=user");

const Users = mongoose.model('Users', {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    cartData: { type: Object },
    date: { type: Date, default: Date.now }
});

app.get("/", (req, res) => {
  res.json({
    groupNumber: "Your Group Number",
    groupMembers: ["Malaika Tabassum", "Farah Shamshair", "Laiba Naeem"],
    projectTitle: "InStyle Cloth Store"
  });
});

// Register new user
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, error: "existing" });
    }

    let cart = {};
    for (let i = 0; i < 300; i++) cart[i] = 0;

    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    });

    await user.save();

    const token = jwt.sign({ user: { id: user.id } }, 'secret_ecom');
    res.json({ success: true, token });
});

// Login user
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user && req.body.password === user.password) {
        const token = jwt.sign({ user: { id: user.id } }, 'secret_ecom');
        res.json({ success: true, token });
    } else {
        res.json({ success: false, errors: "Invalid Email or Password" });
    }
});

// Delete user
app.delete('/deleteUser', async (req, res) => {
  const { token } = req.body;

  try {
      // Verify the token
      const decoded = jwt.verify(token, 'secret_ecom');
      const userId = decoded.user.id;

      // Find the user by id and delete
      const user = await Users.findByIdAndDelete(userId);
      if (user) {
          res.json({ success: true, message: "User deleted successfully" });
      } else {
          res.json({ success: false, message: "User not found" });
      }
  } catch (error) {
      res.json({ success: false, message: "Failed to authenticate or delete user", error });
  }
});

app.listen(port, (error) => {
    if (!error) console.log("Registration Server Running on Port " + port);
    else console.log("Error: " + error);
});
