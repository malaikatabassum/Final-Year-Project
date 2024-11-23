const port = 5000;
const express = require("express");
const { JsonWebTokenError } = require("jsonwebtoken");
const app = express();
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { type } = require("os");

app.use(express.json());
app.use(cors());


app.get("/",(req,res)=>{
  res.json({
    message: "Express App is Running",
    groupNumber: "Your Group Number",
    groupMembers: ["Malaika Tabassum", "Farah Shamshair", "Laiba Naeem"],
    projectTitle: "InStyle Cloth Store"
  });
})







// Creating Endpoint for registering the user
app.post('/signup', async (req,res)=>{

    let check = await Users.findOne({email:req.body.email});
    if (check){
        return res.status(400).json({success:false, error:"existing"});
    }
    let cart = {};
    for (let i=0; i<300; i++) {
        cart[i] = 0;
    }
    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password:req.body.password,
        cartData:cart,
    })

    await user.save();

    const data = {
      user:{
          id:user.id
      }
    }

    const token = jwt.sign(data, 'secret_ecom');
    res.json({success:true,token})
})

//creating endpoint for user login
app.post('/login', async (req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if (user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
          const data = {
            user:{
                id:user.id
            }
          }
          const token = jwt.sign(data, 'secret_ecom');
          res.json({success:true,token});
        }
        else{
          res.json({success:false, errors:"Wrong Password"});
        }
    }
    else{
      res.json({success:false, errors:"Wrong Email Id"})
    }

})




app.listen(port,(error)=>{
  if(!error){
      console.log("Server Running on Port " + port)
  }
  else{
      console.log("Error :"+error)
  }

})