const { Router } = require('express');
const multer = require('../../config/multer')
const Manuscript = require('../../models/manuSchema');
const Sheet = require('../../models/sheetSchema')
const xlsx = require('xlsx');
const {
  addData,
  getUsers,
  getAllGraphs,
  getBothGraphs
} = require('../controllers/userController');
const router = Router();

router.post('/insert', addData);


router.get('/users', getUsers);



router.post('/graph', getAllGraphs);

router.post('/getData', getBothGraphs);

// router.get('/getsomething', async (req, res) => {
//   try {
//     const result = await Manuscript.aggregate([
//       {
//         $unwind: "$process"
//       },
//       {
//         $match: {
//           "process.endTime": {
//             $gte: new Date(req.query.startingDate),
//             $lte: new Date(req.query.endingDate)
//           }
//         }
//       },
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$process.endTime" } },
//           filenames: { $addToSet: "$filename" },
//           totalProductiveTime: { $sum: "$process.process_productive_time" },
//           pageCount: { $sum: "$page_count" }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           date: "$_id",
//           filenames: 1,
//           totalProductiveTime: 1,
//           pageCount: 1,
//           efficiency: {
//             $multiply: [
//               {
//                 $divide: [
//                   { $multiply: [2.4, "$pageCount"] },
//                   "$totalProductiveTime"
//                 ]
//               },
//               100
//             ]
//           },
//           workbookCount: { $size: "$filenames" } 
//         }
//       },
//       {
//         $sort:{date:1}
//       }
//     ]);

//     res.json(result);
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json(error.message)
//   }
// })

// router.get('/dosomething', async (req, res) => {
//   try {
//     const result = await Manuscript.aggregate([
//       {
//         $unwind: "$process"
//       },
//       {
//         $match: {
//           "process.endTime": { $gte: new Date(req.query.startingDate), $lte: new Date(req.query.endingDate) }
//         }
//       },
//       {
//         $group: {
//           _id: {
//             date: { $dateToString: { format: "%Y-%m-%d", date: "$process.endTime" } },
//             processName: "$process.processName"
//           },
//           filenames: { $addToSet: "$filename" },
//           totalProductiveTime: { $sum: "$process.process_productive_time" },
//           pageCount: { $sum: "$page_count" },
//         }
//       },
//       {
//         $group: {
//           _id: { date: "$_id.date" },
//           data: {
//             $push: {
//               processName: "$_id.processName",
//               totalProductiveTime: "$totalProductiveTime",
//               pageCount: "$pageCount",
//               filenames: "$filenames",
//             }
//           }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           date: "$_id.date",
//           data: {
//             $map: {
//               input: "$data",
//               as: "item",
//               in: {
//                 processName: "$$item.processName",
//                 totalProductiveTime: "$$item.totalProductiveTime",
//                 pageCount: "$$item.pageCount",
//                 filenames: "$$item.filenames",
//                 efficiency: {
//                   $multiply: [
//                     {
//                       $divide: [
//                         { $multiply: ["$$item.pageCount", 2.4] },
//                         "$$item.totalProductiveTime"
//                       ]
//                     },
//                     100
//                   ]
//                 },
//                 workbookCount: { $size: "$$item.filenames" } 
//               }
//             }
//           }
//         }
//       },
//       {
//         $sort: { date: 1 }
//       }
//     ])
//     res.json(result);
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json(error.message)
//   }
// })

router.post('/excel', multer.single('sheet'))


module.exports = router;