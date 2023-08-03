const mongoose =require('mongoose');
require('dotenv').config();

const conn=async()=>{
        await mongoose.connect(process.env.MONGO_URL,{useUnifiedTopology:true})
        .then(()=>console.log('mongoDB connected'))
        .catch((err)=>console.log(`database connection error -> ${err.message}`))
}

module.exports=conn;