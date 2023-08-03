const mongoose = require('mongoose');

const manuscriptSchema=new mongoose.Schema({
    filename:{
        type:String,
        required:true
    },
    process:{
        type:[String],
        required:true
    },
    importDate:{
        type:Date,
        required:true
    }
})

module.exports=mongoose.model('manuscript',manuscriptSchema);