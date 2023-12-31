const multer = require('multer');
const path = require('path');

module.exports=multer({
    storage:multer.diskStorage({}),
    fileFilter:(req,file,cb)=>{
        let ext = path.extname(file.originalname);
        if(ext!==".jpg"&& ext!==".xlsx"&&ext!==".jpeg"&&ext!==".png"&&ext!==".JPG"&&ext!==".JPEG"&&ext!==".PNG"&&ext!=='.mp4'&&ext!=='.MP4' ){
            cb(new Error("file is not supported"),false);
            return;
        }
        cb(null,true);
    }
})