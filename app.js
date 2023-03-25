//jshint esversion:6
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');


const app = express();

console.log(process.env.SECRET)

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// create database and schemas
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser:true });

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

// create encryption for mongoose ... only encryt password field .. level 2 security
// secret added to environment variable      
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] }); // using environment variable

const User = mongoose.model("User", userSchema);
 



app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});


// data sent from login template 
app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email:username})
    .then(function(foundUser){
        if (foundUser){
            if (foundUser.password === password){
                res.render("secrets");
                console.log("page found");
            } else {
                console.log("user found, but password did not match");
                res.send("password did not match!")
        } 

    } else {
        console.log("user not found");
        res.send("User not found!")
    }
    })
    .catch(function(err){
        console.log(err);
    })
});



// data sent from register template 
app.post("/register", function(req, res){
    const newUser = new User ({
        email: req.body.username,               // catch the input entered from register template 
        password: req.body.password 
    });

    console.log(newUser);

    

    newUser.save()                              // save new user and if there are no errors.. we will render the user page
    .then(function(){
        console.log("saved to database");
        res.render("secrets");
    })
    .catch(function(err){
        console.log(err);
    });
});









app.listen(3000, function() {
    console.log("Server started on port 3000"); // log the port is active and running
  });