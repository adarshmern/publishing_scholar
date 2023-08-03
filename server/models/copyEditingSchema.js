const mongoose = require('mongoose');

const copyEditingSchema=new mongoose.Schema({
    filename:{
        type:String,
        required:true
    },
    import:{
        type:Date,
        required:true
    },
    start:{
        type:Date,
        required:true
    },
    end:{
        type:Date,
        required:true
    },
    duration:{
        type:Date,
        required:true
    },
    efficiency:{
        type:Number,
    },
    user:{
        type:String,
        required:true
    },
    completion_Date:{
        type:Date,
        required:true
    }
})

module.exports=mongoose.model('copy_editing',copyEditingSchema);