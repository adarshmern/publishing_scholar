const {Router}= require('express');
const { insertData, displayData, addData, getGraph, getUserGraph, getFileGraph, getUsers, getUserProcessData, getFileProcessData, getDateEfficiencyGraphData, getProcessWiseData } = require('../controllers/userController');
const router=Router();

router.post('/add',insertData);

router.get('/data',displayData);

router.post('/insert',addData);

router.get('/graph',getGraph);

router.get('/userGraph',getUserGraph);

router.get('/fileGraph',getFileGraph);

router.get('/userBasedGraph',getUserProcessData);

router.get('/fileBasedGraph',getFileProcessData);

router.get('/users',getUsers);

router.get('/defaultgraph',getProcessWiseData);



module.exports=router;