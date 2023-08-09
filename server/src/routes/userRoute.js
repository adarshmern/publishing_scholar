const {Router}= require('express');
const { 
    insertData, 
    addData, 
    getUsers, 
    graphDefDayOne, 
    graphDefDayOneUser, 
    graphDefDayOneProcessUser, 
    graphDefDayOneProcess, 
    fileSearchFilterGraphOne, 
    fileSearchFilterGraphOneUser, 
    searchgraphDefDayOneProcess, 
    searchgraphDefDayOneProcessUser, 
    filecompletionFilterGraphOne, 
    filecompletionFilterGraphOneUser, 
    completiongraphDefDayOneProcess, 
    completiongraphDefDayOneProcessUser 
} = require('../controllers/userController');
const router=Router();

router.post('/add',insertData);


router.post('/insert',addData);


router.get('/users',getUsers);


// ------------------------------------------------------------ //

router.get('/dayone',graphDefDayOne);

router.get('/dayoneuser',graphDefDayOneUser);

router.get('/dayoneprocessonly',graphDefDayOneProcess);

router.get('/dayoneprocess',graphDefDayOneProcessUser);

router.get('/filterOne',fileSearchFilterGraphOne);

router.get('/filterOneUser',fileSearchFilterGraphOneUser);

router.get('/searchprocess',searchgraphDefDayOneProcess);

router.get('/searchprocessuser',searchgraphDefDayOneProcessUser);

router.get('/compDateOne',filecompletionFilterGraphOne);

router.get('/compDateOneUser',filecompletionFilterGraphOneUser);

router.get('/compDateOneProcess',completiongraphDefDayOneProcess);

router.get('/compDateOneProcessUser',completiongraphDefDayOneProcessUser);


module.exports=router;