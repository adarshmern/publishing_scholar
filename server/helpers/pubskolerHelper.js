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
      elem.efficiency = (((elem.pageCount * 2.4) / elem.totalProductiveTime) * 100).toFixed(2)
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

function calculateEfficiency(pageCount, totalProductiveTime) {
  return (pageCount * 2.4 / totalProductiveTime) * 100;
};

const getDataTwo = async (args) => {
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

const addSheetData = async (args) => {
  try {
    let {
      'File Name': filename,
      'Page count': pg_count,
      'Figure count': figure_count,
      'Table count': table_count,
      'Reference count': reference_count,
      'Duplicates count': duplicates_count,
      'Queries count': queries_count,
      'Journals count': journals_count,
      'Books count': book_count,
      'EditedBook count': edited_book_count,
      'Other-Ref Count': other_ref_count,
      'Import Date': imp_date,
      'PE By': pre_editing_by,
      'Pre-Editing Start Date': pe_dt,
      'Pre-Editing Start Time': pe_tm,
      'Pre-Editing Completed Date': pe_edt,
      'Pre-Editing End Time': pe_et,
      'Pre-Editing Productive Time': pe_prod_time,
      'Pre-Editing Total Time': pe_total__time,
      'CE By': copy_editing_by,
      'CopyEditing Start Date': ce_dt,
      'CopyEditing Start Time': ce_tm,
      'CopyEditing Completed Date': ce_edt,
      'CopyEditing End Time': ce_et,
      'CopyEditing Productive Time': ce_prod_time,
      'CopyEditing Total Time': ce_total__time,
      'EPR By': epr_by,
      'EPR Start Date': epr_dt,
      'EPR Start Time': epr_tm,
      'EPR Completed Date': epr_edt,
      'EPR End Time': epr_et,
      'Archival Date': arch_date
    } = args
    const processArray = [];
    let tTime = 0;

    const newPE = {
      processName: 'Pre Editing',
      user: pre_editing_by,
      startTime: new Date(`${pe_dt} ${pe_tm}`),
      endTime: new Date(`${pe_edt} ${pe_et}`),
      process_productive_time: 0,
      process_total_time: 0,
      process_estimated_time: 480,
      process_target_pages: 200,
      duration: new Date(),
      efficiency: 0,
    };
    newPE.duration = new Date(newPE.endTime) - new Date(newPE.startTime);
    tTime += newPE.duration;
    newPE.process_productive_time = timeToMinutes(pe_prod_time);
    newPE.process_total_time = timeToMinutes(pe_total__time);
    newPE.efficiency = calculateEfficiency(200, 480, pg_count, newPE.process_productive_time)

    processArray.push(newPE);

    const newCE = {
      processName: 'Copy Editing',
      user: copy_editing_by,
      startTime: new Date(`${ce_dt} ${ce_tm}`),
      endTime: new Date(`${ce_edt} ${ce_et}`),
      process_productive_time: 0,
      process_total_time: 0,
      process_estimated_time: 480,
      process_target_pages: 150,
      duration: new Date(),
      efficiency: 0,
    };
    newCE.duration = new Date(newCE.endTime) - new Date(newCE.startTime);
    tTime += newCE.duration;
    newCE.ce = timeToMinutes(pe_prod_time);
    newCE.process_productive_time = timeToMinutes(ce_prod_time);
    newCE.process_total_time = timeToMinutes(ce_total__time);
    newCE.efficiency = calculateEfficiency(150, 480, pg_count, newCE.process_productive_time)


    processArray.push(newCE);
    if (edited_book_count === '-') {
      edited_book_count = 0;
    }
    if (journals_count === '-') {
      journals_count = 0;
    }
    if (book_count === '-') {
      book_count = 0;
    }
    if (other_ref_count === '-') {
      other_ref_count = 0;
    }
    const newData = new Sheet({
      filename,
      importDate: imp_date,
      process: processArray,
      completion_Date: arch_date,
      page_count: pg_count,
      figure_count,
      table_count,
      reference_count,
      duplicates_count,
      queries_count,
      journals_count,
      book_count,
      edited_book_count,
      other_ref_count,
      totalTime: tTime
    });

    await newData.save();
    return 'data added'
  } catch (err) {
    console.log(err.message);
    return undefined
  }
}




module.exports = {
  efficiencyGraphOne,
  efficiencyGraphTwo,
  getDataOne,
  getDataTwo,
  addSheetData
}