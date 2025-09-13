const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();
const MONGO_URI=process.env.MONGO_URI;

const connectDB = async()=>{
    try{
        await mongoose.connect(MONGO_URI,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
        });
        console.log("MongoDB connected");
       console.log("User model is ready");
    }
    catch(err){
        console.error(err.message);
        process.exit(1);
    }
}

connectDB();
module.exports = connectDB;