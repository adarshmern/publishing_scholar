const {Router}= require('express');
const { 
    addData, 
    getUsers, 
    getGraphOne,
    getGraphTwo
} = require('../controllers/userController');
const router=Router();


router.post('/insert',addData);


router.get('/users',getUsers);


// ------------------------------------------------------------ //



router.post('/graphOne',getGraphOne);

router.post('/graphTwo',getGraphTwo);


module.exports=router;