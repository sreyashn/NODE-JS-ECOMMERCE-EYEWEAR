const express = require("express");
const session =require('express-session');
const mongoose = require("mongoose");
const config = require("../project/config.js/config");
mongoose.connect("mongodb://127.0.0.1:27017/e-commerce");

const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");

const path = require("path");
const app = express();

app.set("view engine", "ejs");
app.set("views","./views");


app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
  
  })
);

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "CACHE_CONTROL_HEADER");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//static
app.use(express.static(path.join(__dirname, 'public')));



// for user route
app.use("/",userRoute);
// for admin  route
app.use("/admin",adminRoute);

app.listen(5000, function () {
    console.log(
      "Server is running...Registration Page at http://localhost:5000"
    );
  });
  