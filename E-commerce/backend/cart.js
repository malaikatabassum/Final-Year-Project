const port = 8080;
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

mongoose.connect("mongodb+srv://tmalaika:malaika1234@user.bkswf.mongodb.net/?retryWrites=true&w=majority&appName=user");

app.get("/",(req,res)=>{
  res.json({
    message: "Express App is Running",
    groupNumber: "Your Group Number",
    groupMembers: ["Malaika Tabassum", "Farah Shamshair", "Laiba Naeem"],
    projectTitle: "InStyle Cloth Store"
  });
})




const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now, 
    }


})




// creating middleware to fetch user
const fetchUser = async (req,res,next)=>{
  const token = req.header('auth-token');
  if(!token){
   res.status(401).send({errors:"Please authenticate using valid token"})
 }
 else{
   try {
       const data = jwt.verify(token, 'secret_ecom');
       req.user = data.user;
       next();
   } catch (error){
     res.status(401).send({errors:"Please authenticate using valid token"})
   }
 }
}
app.post('/addtocart',fetchUser, async (req, res)=>{
  console.log("Added",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] += 1;
    await Users.findByIdAndUpdate({_id:req.user.id},{cartData:userData.cartData})
    res.send("Added")
})

app.post('/removefromcart',fetchUser, async (req, res)=>{
  console.log("removed",req.body.itemId);
  let userData = await Users.findOne({_id:req.user.id});
  if(userData.cartData[req.body.itemId]>0)
  userData.cartData[req.body.itemId] -= 1;
  await Users.findByIdAndUpdate({_id:req.user.id},{cartData:userData.cartData})
  res.send("Removed")
})

//creating endpoint to get cartdata

app.post('/getcart',fetchUser, async(req, res)=>{
  console.log("GetCart");
  let userData = await Users.findOne({_id:req.user.id});
  if (userData && userData.cartData) {
    res.json(userData.cartData);
} else {
    res.status(404).json({ message: "User or cart data not found" });
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