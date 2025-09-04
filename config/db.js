const mongoose = require('mongoose');
const User = require('../models/user');
const MONGO_URI="mongodb+srv://admin:SF8r1S4ndRzSlfh9@cluster0.oxntcfg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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