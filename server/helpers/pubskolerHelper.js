const Manuscript = require('../models/manuSchema');

const efficiencyGraphOne = async (args) => {
  try {
    const { processRangeStart, processRangeEnd, completionRangeStart, completionRangeEnd, user, key } = args;

    let matchStage = {};
    let groupStage = {};

    if (processRangeStart && processRangeEnd) {
      matchStage = {
        'process.endTime': {
          $gte: new Date(processRangeStart),
          $lte: new Date(processRangeEnd)
        }
      };
      groupStage = {
        _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$process.endTime' } } },
        filenames: { $addToSet: "$filename" },
        totalProductiveTime: { $sum: "$process.process_productive_time" },
        pageCount: { $sum: "$page_count" }
      };
    } else if (completionRangeStart && completionRangeEnd) {
      matchStage = {
        'completion_Date': {
          $gte: new Date(completionRangeStart),
          $lte: new Date(completionRangeEnd)
        }
      };
      groupStage = {
        _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$completion_Date' } } },
        filenames: { $addToSet: "$filename" },
        totalProductiveTime: { $sum: "$process.process_productive_time" },
        pageCount: { $sum: "$page_count" }
      };
    }
    if (user) {
      matchStage['process.user'] = user;
    }
    if (key) {
      matchStage['filename'] = { $regex: `^${key}`, $options: 'i' };
    }

    const result = await Manuscript.aggregate([
      {
        $unwind: "$process"
      },
      {
        $match: matchStage
      },
      {
        $group: groupStage
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          filenames: 1,
          totalProductiveTime: 1,
          pageCount: 1,
          efficiency: {
            $multiply: [
              {
                $divide: [
                  { $multiply: [2.4, "$pageCount"] },
                  "$totalProductiveTime"
                ]
              },
              100
            ]
          },
          workbookCount: { $size: "$filenames" }
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);
    await Promise.all(result.map(async (element) => {
      let page = 0;
      await Promise.all(element.filenames.map(async (elem) => {
        const doc = await Manuscript.findOne({ filename: elem });
        page += doc.page_count;
      }));
      element.pageCount = page;
    }));

    Promise.all(result.map(async (elem) => {
      elem.efficiency = ((elem.pageCount * 2.4) / elem.totalProductiveTime) * 100
    }));

    return result;

  } catch (err) {
    console.log(err.message);
    return undefined;
  }
};


// const efficiencyGraphTwo = async (args) => {
//   try {
//       const { processRangeStart, processRangeEnd, user, key } = args;

//       const matchStage = {
//           'process.endTime': {
//               $gte: new Date(processRangeStart),
//               $lte: new Date(processRangeEnd)
//           }
//       };

//       if (user) {
//           matchStage['process.user'] = user;
//       }
//       if (key) {
//           matchStage['filename'] = { $regex: `^${key}`, $options: 'i' };
//       }

//       const result = await Manuscript.aggregate([
//           {
//               $unwind: "$process"
//           },
//           {
//               $match: matchStage
//           },
//           {
//               $group: {
//                   _id: {
//                       date: { $dateToString: { format: "%Y-%m-%d", date: "$process.endTime" } },
//                       processName: "$process.processName"
//                   },
//                   filenames: { $addToSet: "$filename" },
//                   totalProductiveTime: { $sum: "$process.process_productive_time" },
//                   pageCount: { $sum: "$page_count" }
//               }
//           },
//           {
//               $group: {
//                   _id: { date: "$_id.date" },
//                   data: {
//                       $push: {
//                           processName: "$_id.processName",
//                           totalProductiveTime: "$totalProductiveTime",
//                           filenames: "$filenames",
//                           pageCount: "$pageCount"
//                       }
//                   }
//               }
//           },
//           {
//               $project: {
//                   _id: 0,
//                   date: "$_id.date",
//                   data: {
//                       $map: {
//                           input: "$data",
//                           as: "item",
//                           in: {
//                               processName: "$$item.processName",
//                               totalProductiveTime: "$$item.totalProductiveTime",
//                               filenames: "$$item.filenames",
//                               pageCount: "$$item.pageCount",
//                               efficiency: {
//                                   $multiply: [
//                                       {
//                                           $divide: [
//                                               { $multiply: ["$$item.pageCount", 2.4] },
//                                               "$$item.totalProductiveTime"
//                                           ]
//                                       },
//                                       100
//                                   ]
//                               },
//                               workbookCount: { $size: "$$item.filenames" }
//                           }
//                       }
//                   }
//               }
//           },
//           {
//               $sort: { date: 1 }
//           }
//       ]);

//     return result;
//   } catch (err) {
//       console.log(err.message);
//       return undefined;
//   }
// }


const efficiencyGraphTwo = async (args) => {
  try {
    const { processRangeStart, processRangeEnd, completionRangeStart, completionRangeEnd, user, key } = args;

    let matchStage = {};
    let groupStage = {};

    if (processRangeStart && processRangeEnd) {
      matchStage = {
        'process.endTime': {
          $gte: new Date(processRangeStart),
          $lte: new Date(processRangeEnd)
        }
      };
      groupStage = {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$process.endTime" } },
          processName: "$process.processName"
        },
        filenames: { $addToSet: "$filename" },
        totalProductiveTime: { $sum: "$process.process_productive_time" },
        pageCount: { $sum: "$page_count" }
      };
    } else if (completionRangeStart && completionRangeEnd) {
      matchStage = {
        'completion_Date': {
          $gte: new Date(completionRangeStart),
          $lte: new Date(completionRangeEnd)
        }
      };
      groupStage = {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$completion_Date" } },
          processName: "$process.processName"
        },
        filenames: { $addToSet: "$filename" },
        totalProductiveTime: { $sum: "$process.process_productive_time" },
        pageCount: { $sum: "$page_count" }
      };
    }

    if (user) {
      matchStage['process.user'] = user;
    }
    if (key) {
      matchStage['filename'] = { $regex: `^${key}`, $options: 'i' };
    }

    const result = await Manuscript.aggregate([
      {
        $unwind: "$process"
      },
      {
        $match: matchStage
      },
      {
        $group: groupStage
      },
      {
        $group: {
          _id: { date: "$_id.date" },
          data: {
            $push: {
              processName: "$_id.processName",
              totalProductiveTime: "$totalProductiveTime",
              filenames: "$filenames",
              pageCount: "$pageCount"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          data: {
            $map: {
              input: "$data",
              as: "item",
              in: {
                processName: "$$item.processName",
                totalProductiveTime: "$$item.totalProductiveTime",
                filenames: "$$item.filenames",
                pageCount: "$$item.pageCount",
                efficiency: {
                  $multiply: [
                    {
                      $divide: [
                        { $multiply: ["$$item.pageCount", 2.4] },
                        "$$item.totalProductiveTime"
                      ]
                    },
                    100
                  ]
                },
                workbookCount: { $size: "$$item.filenames" }
              }
            }
          }
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    return result;
  } catch (err) {
    console.log(err.message);
    return undefined;
  }
}


const getDataOne = async (args) => {
  try {
    const { processRangeStart, processRangeEnd, completionRangeStart, completionRangeEnd, user, key } = args;

    let matchStage = {};
    let groupStage = {};

    if (processRangeStart && processRangeEnd) {
      matchStage = {
        'process.endTime': {
          $gte: new Date(processRangeStart),
          $lte: new Date(processRangeEnd)
        }
      };
      groupStage = {
        _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$process.endTime' } } },
        filenames: { $addToSet: "$filename" },
        totalProductiveTime: { $sum: "$process.process_productive_time" },
        pageCount: { $sum: "$page_count" }
      };
    } else if (completionRangeStart && completionRangeEnd) {
      matchStage = {
        'completion_Date': {
          $gte: new Date(completionRangeStart),
          $lte: new Date(completionRangeEnd)
        }
      };
      groupStage = {
        _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$completion_Date' } } },
        filenames: { $addToSet: "$filename" },
        totalProductiveTime: { $sum: "$process.process_productive_time" },
        pageCount: { $sum: "$page_count" }
      };
    }
    if (user) {
      matchStage['process.user'] = user;
    }
    if (key) {
      matchStage['filename'] = { $regex: `^${key}`, $options: 'i' };
    }

    const dateWiseData = await Manuscript.aggregate([
      {
        $unwind: "$process"
      },
      {
        $match: matchStage
      },
      {
        $group: groupStage
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          filenames: 1,
          totalProductiveTime: 1,
          pageCount: 1,
          workbookCount: { $size: "$filenames" }
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);
    await Promise.all(dateWiseData.map(async (element) => {
      let page = 0;
      await Promise.all(element.filenames.map(async (elem) => {
        const doc = await Manuscript.findOne({ filename: elem });
        page += doc.page_count;
      }));
      element.pageCount = page;
    }));

    Promise.all(dateWiseData.map(async (elem) => {
      elem.efficiency = ((elem.pageCount * 2.4) / elem.totalProductiveTime) * 100
    }));

    return dateWiseData;

  } catch (err) {
    console.log(err.message);
    return undefined;
  }
};

function calculateEfficiency(pageCount, totalProductiveTime){
  return (pageCount * 2.4 / totalProductiveTime) * 100;
};

const getDataTwo=async(args)=>{
  try {
    const { processRangeStart, processRangeEnd, completionRangeStart, completionRangeEnd, user, key } = args;

    let matchStage = {};
    let groupStage = {};

    if (processRangeStart && processRangeEnd) {
      matchStage = {
        'process.endTime': {
          $gte: new Date(processRangeStart),
          $lte: new Date(processRangeEnd)
        }
      };
      groupStage = {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$process.endTime" } },
          processName: "$process.processName"
        },
        filenames: { $addToSet: "$filename" },
        totalProductiveTime: { $sum: "$process.process_productive_time" },
        pageCount: { $sum: "$page_count" }
      };
    } else if (completionRangeStart && completionRangeEnd) {
      matchStage = {
        'completion_Date': {
          $gte: new Date(completionRangeStart),
          $lte: new Date(completionRangeEnd)
        }
      };
      groupStage = {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$completion_Date" } },
          processName: "$process.processName"
        },
        filenames: { $addToSet: "$filename" },
        totalProductiveTime: { $sum: "$process.process_productive_time" },
        pageCount: { $sum: "$page_count" }
      };
    }

    if (user) {
      matchStage['process.user'] = user;
    }
    if (key) {
      matchStage['filename'] = { $regex: `^${key}`, $options: 'i' };
    }

    const result = await Manuscript.aggregate([
      {
        $unwind: "$process"
      },
      {
        $match: matchStage
      },
      {
        $group: groupStage
      },
      {
        $group: {
          _id: { date: "$_id.date" },
          data: {
            $push: {
              processName: "$_id.processName",
              totalProductiveTime: "$totalProductiveTime",
              filenames: "$filenames",
              pageCount: "$pageCount"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          data: {
            $map: {
              input: "$data",
              as: "item",
              in: {
                processName: "$$item.processName",
                totalProductiveTime: "$$item.totalProductiveTime",
                filenames: "$$item.filenames",
                pageCount: "$$item.pageCount",
                workbookCount: { $size: "$$item.filenames" }
              }
            }
          }
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    result.forEach(dateItem => {
      dateItem.data.forEach(item => {
        item.efficiency = calculateEfficiency(item.pageCount, item.totalProductiveTime);
      });
    });

    return result;
  } catch (err) {
    console.log(err.message);
    return undefined;
  }
}


module.exports = {
  efficiencyGraphOne,
  efficiencyGraphTwo,
  getDataOne,
  getDataTwo
}