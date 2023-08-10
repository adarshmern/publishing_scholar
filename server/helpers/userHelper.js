const RawData = require('../models/manuSchema');

const dateWiseGraph= async (dateOne, dateTwo) => {
    try {
        console.log(dateOne, dateTwo);
        const startDate = new Date(dateOne);
        const endDate = new Date(dateTwo);
        const result = await RawData.aggregate([
            {
                $unwind: '$process'
            },
            {
                $match: {
                    'process.endTime': {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$process.endTime' } },
                    },
                    pageCount: { $sum: '$process.page_count' },
                    processes: { $push: '$process' },
                    filenames: { $addToSet: '$filename' },
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    efficiency: {
                        $divide: [
                            { $multiply: ['$pageCount', 2.4] },
                            { $sum: '$processes.process_productive_time' }
                        ]
                    },
                    pageCount: 1,
                    filenames: 1,
                }
            },
            {
                $project: {
                    date: 1,
                    efficiency: {
                        $divide: [
                            { $trunc: { $multiply: ['$efficiency', 100] } },
                            100
                        ]
                    },
                    pageCount: 1,
                    filenames: 1,
                    workbookCount: { $size: '$filenames' },
                }
            },
            {
                $sort: {
                    date: 1
                }
            }
        ]);
        return result;
    } catch (err) {
        console.log(err.message);
        return undefined;
    }
}

const dateWiseGraphWithUser= async (dateOne, dateTwo,user) => {
    try {
        const startDate = new Date(dateOne);
        const endDate = new Date(dateTwo);
        const result = await RawData.aggregate([
            {
                $unwind: '$process'
            },
            {
                $match: {
                    'process.endTime': {
                        $gte: startDate,
                        $lte: endDate
                    },
                    'process.user': user 
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$process.endTime' } },
                    },
                    pageCount: { $sum: '$process.page_count' },
                    processes: { $push: '$process' },
                    filenames: { $addToSet: '$filename' }, 
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    efficiency: {
                        $divide: [
                            { $multiply: ['$pageCount', 2.4] },
                            { $sum: '$processes.process_productive_time' }
                        ]
                    },
                    pageCount: 1,
                    filenames: 1,
                }
            },
            {
                $project: {
                    date: 1,
                    efficiency: {
                        $divide: [
                            { $trunc: { $multiply: ['$efficiency', 100] } },
                            100
                        ]
                    },
                    pageCount: 1,
                    filenames:1,
                    workbookCount: { $size: '$filenames' },
                }
            },
            {
                $sort: {
                    date: 1
                }
            }
        ])

        return result
    } catch (err) {
        console.log(err.message);
        return undefined;
    }
}

const dateWiseProcessGraph= async (dateOne, dateTwo) => {
    try {
        const startDate = new Date(dateOne);
        const endDate = new Date(dateTwo);
        const result = await RawData.aggregate([
            {
                $match: {
                    "process.endTime": { $gte: startDate, $lte: endDate },
                },
            },
            {
                $unwind: "$process",
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$process.endTime" } },
                        processName: "$process.processName",
                    },
                    totalPageCount: { $sum: "$process.page_count" },
                    totalEfficiency: {
                        $sum: {
                            $divide: [
                                { $multiply: ["$process.page_count", 2.4] },
                                "$process.process_productive_time",
                            ],
                        },
                    },
                    filenames: { $addToSet: "$filename" },
                },
            },
            {
                $group: {
                    _id: "$_id.date",
                    data: {
                        $push: {
                            processName: "$_id.processName",
                            efficiency: "$totalEfficiency" ,
                            pageCount: "$totalPageCount",
                            filenames: "$filenames",
                            workbookCount: { $sum: { $size: "$filenames" } },
                        },
                    },

                },
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    data: 1,
                },
            },
            {
                $sort: { date: 1 },
            },
        ]);


        return result
    } catch (err) {
        console.log(err.message);
        return undefined;
    }
}

const dateWiseProcessGraphWithUser= async (dateOne, dateTwo,user) => {
    try {
        const startDate = new Date(dateOne);
        const endDate = new Date(dateTwo);
        const result = await RawData.aggregate([
            {
                $match: {
                    "process.endTime": { $gte: startDate, $lte: endDate },
                    "process.user": user
                }
            },
            {
                $unwind: "$process"
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$process.endTime" } },
                        processName: "$process.processName"
                    },
                    totalPageCount: { $sum: "$process.page_count" },
                    totalEfficiency: {
                        $sum: {
                            $divide: [
                                { $multiply: ["$process.page_count", 2.4] },
                                "$process.process_productive_time"
                            ]
                        }
                    },
                    filenames: { $addToSet: "$filename" },
                }
            },
            {
                $group: {
                    _id: "$_id.date",
                    data: {
                        $push: {
                            processName: "$_id.processName",
                            efficiency: "$totalEfficiency" ,
                            pageCount: "$totalPageCount",
                            filenames: "$filenames",
                            workbookCount: { $sum: { $size: "$filenames" } },
                        }
                    },
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    data: 1
                }
            },
            {
                $sort: { date: 1 }
            }
        ])
        return result
    } catch (err) {
        console.log(err.message);
        return undefined;
    }
}

const dateWiseFileSearchGraph= async (dateOne, dateTwo,key) => {
    try {
        const startDate = new Date(dateOne);
        const endDate = new Date(dateTwo);
        const result = await RawData.aggregate([
            {
                $unwind: '$process'
            },
            {
                $match: {
                    'process.endTime': {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $match: {
                    filename: { $regex: `^${key}`, $options: 'i' } 
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$process.endTime' } },
                    },
                    pageCount: { $sum: '$process.page_count' },
                    processes: { $push: '$process' },
                    filenames: { $addToSet: '$filename' },
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    efficiency: {
                        $divide: [
                            { $multiply: ['$pageCount', 2.4] },
                            { $sum: '$processes.process_productive_time' }
                        ]
                    },
                    pageCount: 1,
                    filenames: 1,
                }
            },
            {
                $project: {
                    date: 1,
                    efficiency: {
                        $divide: [
                            { $trunc: { $multiply: ['$efficiency', 100] } },
                            100
                        ]
                    },
                    pageCount: 1,
                    filenames: 1,
                    workbookCount: { $size: '$filenames' },
                }
            },
            {
                $sort: {
                    date: 1
                }
            }
        ]);
        return result;

    } catch (err) {
        console.log(err.message);
        return undefined;
    }
}

const dateWiseFileSearchGraphWithUser= async (dateOne, dateTwo,key,user) => {
    try {
        const startDate = new Date(dateOne);
        const endDate = new Date(dateTwo);
        const result = await RawData.aggregate([
            {
                $unwind: '$process'
            },
            {
                $match: {
                    'process.endTime': {
                        $gte: startDate,
                        $lte: endDate
                    },
                    "process.user":user
                }
            },
            {
                $match: {
                    filename: { $regex: `^${key}`, $options: 'i' } 
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$process.endTime' } },
                    },
                    pageCount: { $sum: '$process.page_count' },
                    processes: { $push: '$process' },
                    filenames: { $addToSet: '$filename' },
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    efficiency: {
                        $divide: [
                            { $multiply: ['$pageCount', 2.4] },
                            { $sum: '$processes.process_productive_time' }
                        ]
                    },
                    pageCount: 1,
                    filenames: 1,
                }
            },
            {
                $project: {
                    date: 1,
                    efficiency: {
                        $divide: [
                            { $trunc: { $multiply: ['$efficiency', 100] } },
                            100
                        ]
                    },
                    pageCount: 1,
                    filenames: 1,
                    workbookCount: { $size: '$filenames' },
                }
            },
            {
                $sort: {
                    date: 1
                }
            }
        ]);
        return result;

    } catch (err) {
        console.log(err.message);
        return undefined;
    }
}

const dateWiseFileSearchProcessGraph= async (dateOne, dateTwo,key) => {
    try {
        const startDate = new Date(dateOne);
        const endDate = new Date(dateTwo);
        const result = await RawData.aggregate([
            {
                $match: {
                    "process.endTime": { $gte: startDate, $lte: endDate },
                },
            },
            {
                $match: {
                    filename: { $regex: `^${key}`, $options: 'i' } 
                }
            },
            {
                $unwind: "$process",
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$process.endTime" } },
                        processName: "$process.processName",
                    },
                    totalPageCount: { $sum: "$process.page_count" },
                    totalEfficiency: {
                        $sum: {
                            $divide: [
                                { $multiply: ["$process.page_count", 2.4] },
                                "$process.process_productive_time",
                            ],
                        },
                    },
                    filenames: { $addToSet: "$filename" },
                },
            },
            {
                $group: {
                    _id: "$_id.date",
                    data: {
                        $push: {
                            processName: "$_id.processName",
                            efficiency: "$totalEfficiency" ,
                            pageCount: "$totalPageCount",
                            filenames: "$filenames",
                            workbookCount: { $sum: { $size: "$filenames" } },
                        },
                    },

                },
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    data: 1,
                },
            },
            {
                $sort: { date: 1 },
            },
        ]);


        return result
    } catch (err) {
        console.log(err.message);
        return undefined;
    }
}

const dateWiseFileSearchProcessGraphWithUser= async (dateOne, dateTwo,key,user) => {
    try {
        const startDate = new Date(dateOne);
        const endDate = new Date(dateTwo);
        const result = await RawData.aggregate([
            {
                $match: {
                    "process.endTime": { $gte: startDate, $lte: endDate },
                    "process.user": user
                }
            },
            {
                $match: {
                    filename: { $regex: `^${key}`, $options: 'i' } 
                }
            },
            {
                $unwind: "$process"
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$process.endTime" } },
                        processName: "$process.processName"
                    },
                    totalPageCount: { $sum: "$process.page_count" },
                    totalEfficiency: {
                        $sum: {
                            $divide: [
                                { $multiply: ["$process.page_count", 2.4] },
                                "$process.process_productive_time"
                            ]
                        }
                    },
                    filenames: { $addToSet: "$filename" },
                }
            },
            {
                $group: {
                    _id: "$_id.date",
                    data: {
                        $push: {
                            processName: "$_id.processName",
                            efficiency: "$totalEfficiency" ,
                            pageCount: "$totalPageCount",
                            filenames: "$filenames",
                            workbookCount: { $sum: { $size: "$filenames" } },
                        }
                    },
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    data: 1
                }
            },
            {
                $sort: { date: 1 }
            }
        ])
        return result
    } catch (err) {
        console.log(err.message);
        return undefined;
    }
}

// ----------------------------------------------------------------------------//

const completionDateWiseGraph= async (dateOne, dateTwo) => {
    try {
        const startDate = new Date(dateOne);
        const endDate = new Date(dateTwo);
        const result = await RawData.aggregate([
            {
                $unwind: '$process'
            },
            {
                $match: {
                    'completion_Date': {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$completion_Date' } },
                    },
                    pageCount: { $sum: '$process.page_count' },
                    processes: { $push: '$process' },
                    filenames: { $addToSet: '$filename' },
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    efficiency: {
                        $divide: [
                            { $multiply: ['$pageCount', 2.4] },
                            { $sum: '$processes.process_productive_time' }
                        ]
                    },
                    pageCount: 1,
                    filenames: 1,
                }
            },
            {
                $project: {
                    date: 1,
                    efficiency: {
                        $divide: [
                            { $trunc: { $multiply: ['$efficiency', 100] } },
                            100
                        ]
                    },
                    pageCount: 1,
                    filenames: 1,
                    workbookCount: { $size: '$filenames' },
                }
            },
            {
                $sort: {
                    date: 1
                }
            }
        ]);
        return result;
    } catch (err) {
        console.log(err.message);
        return undefined;
    }
}

const completionDateWiseGraphWithUser= async (dateOne, dateTwo,user) => {
    try {
        const startDate = new Date(dateOne);
        const endDate = new Date(dateTwo);
        const result = await RawData.aggregate([
            {
                $unwind: '$process'
            },
            {
                $match: {
                    'completion_Date': {
                        $gte: startDate,
                        $lte: endDate
                    },
                    'process.user': user 
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$completion_Date' } },
                    },
                    pageCount: { $sum: '$process.page_count' },
                    processes: { $push: '$process' },
                    filenames: { $addToSet: '$filename' }, 
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    efficiency: {
                        $divide: [
                            { $multiply: ['$pageCount', 2.4] },
                            { $sum: '$processes.process_productive_time' }
                        ]
                    },
                    pageCount: 1,
                    filenames: 1,
                }
            },
            {
                $project: {
                    date: 1,
                    efficiency: {
                        $divide: [
                            { $trunc: { $multiply: ['$efficiency', 100] } },
                            100
                        ]
                    },
                    pageCount: 1,
                    filenames:1,
                    workbookCount: { $size: '$filenames' },
                }
            },
            {
                $sort: {
                    date: 1
                }
            }
        ])

        return result
    } catch (err) {
        console.log(err.message);
        return undefined;
    }
}

const completionDateWiseProcessGraph= async (dateOne, dateTwo) => {
    try {
        const startDate = new Date(dateOne);
        const endDate = new Date(dateTwo);
        const result = await RawData.aggregate([
            {
                $match: {
                    "completion_Date": { $gte: startDate, $lte: endDate },
                },
            },
            {
                $unwind: "$process",
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$completion_Date" } },
                        processName: "$process.processName",
                    },
                    totalPageCount: { $sum: "$process.page_count" },
                    totalEfficiency: {
                        $sum: {
                            $divide: [
                                { $multiply: ["$process.page_count", 2.4] },
                                "$process.process_productive_time",
                            ],
                        },
                    },
                    filenames: { $addToSet: "$filename" },
                },
            },
            {
                $group: {
                    _id: "$_id.date",
                    data: {
                        $push: {
                            processName: "$_id.processName",
                            efficiency: "$totalEfficiency" ,
                            pageCount: "$totalPageCount",
                            filenames: "$filenames",
                            workbookCount: { $sum: { $size: "$filenames" } },
                        },
                    },

                },
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    data: 1,
                },
            },
            {
                $sort: { date: 1 },
            },
        ]);


        return result
    } catch (err) {
        console.log(err.message);
        return undefined;
    }
}

const completionDateWiseProcessGraphWithUser= async (dateOne, dateTwo,user) => {
    try {
        const startDate = new Date(dateOne);
        const endDate = new Date(dateTwo);
        const result = await RawData.aggregate([
            {
                $match: {
                    "completion_Date": { $gte: startDate, $lte: endDate },
                    "process.user": user
                }
            },
            {
                $unwind: "$process"
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$completion_Date" } },
                        processName: "$process.processName"
                    },
                    totalPageCount: { $sum: "$process.page_count" },
                    totalEfficiency: {
                        $sum: {
                            $divide: [
                                { $multiply: ["$process.page_count", 2.4] },
                                "$process.process_productive_time"
                            ]
                        }
                    },
                    filenames: { $addToSet: "$filename" },
                }
            },
            {
                $group: {
                    _id: "$_id.date",
                    data: {
                        $push: {
                            processName: "$_id.processName",
                            efficiency: "$totalEfficiency" ,
                            pageCount: "$totalPageCount",
                            filenames: "$filenames",
                            workbookCount: { $sum: { $size: "$filenames" } },
                        }
                    },
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    data: 1
                }
            },
            {
                $sort: { date: 1 }
            }
        ])
        return result
    } catch (err) {
        console.log(err.message);
        return undefined;
    }
}

const completionDateWiseFileSearchGraph= async (dateOne, dateTwo,key) => {
    try {
        const startDate = new Date(dateOne);
        const endDate = new Date(dateTwo);
        const result = await RawData.aggregate([
            {
                $unwind: '$process'
            },
            {
                $match: {
                    'completion_Date': {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $match: {
                    filename: { $regex: `^${key}`, $options: 'i' } 
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$completion_Date' } },
                    },
                    pageCount: { $sum: '$process.page_count' },
                    processes: { $push: '$process' },
                    filenames: { $addToSet: '$filename' },
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    efficiency: {
                        $divide: [
                            { $multiply: ['$pageCount', 2.4] },
                            { $sum: '$processes.process_productive_time' }
                        ]
                    },
                    pageCount: 1,
                    filenames: 1,
                }
            },
            {
                $project: {
                    date: 1,
                    efficiency: {
                        $divide: [
                            { $trunc: { $multiply: ['$efficiency', 100] } },
                            100
                        ]
                    },
                    pageCount: 1,
                    filenames: 1,
                    workbookCount: { $size: '$filenames' },
                }
            },
            {
                $sort: {
                    date: 1
                }
            }
        ]);
        return result;

    } catch (err) {
        console.log(err.message);
        return undefined;
    }
}

const completionDateWiseFileSearchGraphWithUser= async (dateOne, dateTwo,key,user) => {
    try {
        const startDate = new Date(dateOne);
        const endDate = new Date(dateTwo);
        const result = await RawData.aggregate([
            {
                $unwind: '$process'
            },
            {
                $match: {
                    'completion_Date': {
                        $gte: startDate,
                        $lte: endDate
                    },
                    "process.user":user
                }
            },
            {
                $match: {
                    filename: { $regex: `^${key}`, $options: 'i' } 
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$completion_Date' } },
                    },
                    pageCount: { $sum: '$process.page_count' },
                    processes: { $push: '$process' },
                    filenames: { $addToSet: '$filename' },
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    efficiency: {
                        $divide: [
                            { $multiply: ['$pageCount', 2.4] },
                            { $sum: '$processes.process_productive_time' }
                        ]
                    },
                    pageCount: 1,
                    filenames: 1,
                }
            },
            {
                $project: {
                    date: 1,
                    efficiency: {
                        $divide: [
                            { $trunc: { $multiply: ['$efficiency', 100] } },
                            100
                        ]
                    },
                    pageCount: 1,
                    filenames: 1,
                    workbookCount: { $size: '$filenames' },
                }
            },
            {
                $sort: {
                    date: 1
                }
            }
        ]);
        return result;

    } catch (err) {
        console.log(err.message);
        return undefined;
    }
}

const completionDateWiseFileSearchProcessGraph= async (dateOne, dateTwo,key) => {
    try {
        const startDate = new Date(dateOne);
        const endDate = new Date(dateTwo);
        const result = await RawData.aggregate([
            {
                $match: {
                    "completion_Date": { $gte: startDate, $lte: endDate },
                },
            },
            {
                $match: {
                    filename: { $regex: `^${key}`, $options: 'i' } 
                }
            },
            {
                $unwind: "$process",
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$completion_Date" } },
                        processName: "$process.processName",
                    },
                    totalPageCount: { $sum: "$process.page_count" },
                    totalEfficiency: {
                        $sum: {
                            $divide: [
                                { $multiply: ["$process.page_count", 2.4] },
                                "$process.process_productive_time",
                            ],
                        },
                    },
                    filenames: { $addToSet: "$filename" },
                },
            },
            {
                $group: {
                    _id: "$_id.date",
                    data: {
                        $push: {
                            processName: "$_id.processName",
                            efficiency: "$totalEfficiency" ,
                            pageCount: "$totalPageCount",
                            filenames: "$filenames",
                            workbookCount: { $sum: { $size: "$filenames" } },
                        },
                    },

                },
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    data: 1,
                },
            },
            {
                $sort: { date: 1 },
            },
        ]);


        return result
    } catch (err) {
        console.log(err.message);
        return undefined;
    }
}

const completionDateWiseFileSearchProcessGraphWithUser= async (dateOne, dateTwo,key,user) => {
    try {
        const startDate = new Date(dateOne);
        const endDate = new Date(dateTwo);
        const result = await RawData.aggregate([
            {
                $match: {
                    "completion_Date": { $gte: startDate, $lte: endDate },
                    "process.user": user
                }
            },
            {
                $match: {
                    filename: { $regex: `^${key}`, $options: 'i' } 
                }
            },
            {
                $unwind: "$process"
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$completion_Date" } },
                        processName: "$process.processName"
                    },
                    totalPageCount: { $sum: "$process.page_count" },
                    totalEfficiency: {
                        $sum: {
                            $divide: [
                                { $multiply: ["$process.page_count", 2.4] },
                                "$process.process_productive_time"
                            ]
                        }
                    },
                    filenames: { $addToSet: "$filename" },
                }
            },
            {
                $group: {
                    _id: "$_id.date",
                    data: {
                        $push: {
                            processName: "$_id.processName",
                            efficiency: "$totalEfficiency" ,
                            pageCount: "$totalPageCount",
                            filenames: "$filenames",
                            workbookCount: { $sum: { $size: "$filenames" } },
                        }
                    },
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    data: 1
                }
            },
            {
                $sort: { date: 1 }
            }
        ])
        return result
    } catch (err) {
        console.log(err.message);
        return undefined;
    }
}


module.exports={
    dateWiseGraph,
    dateWiseGraphWithUser,
    dateWiseProcessGraph,
    dateWiseProcessGraphWithUser,
    dateWiseFileSearchGraph,
    dateWiseFileSearchGraphWithUser,
    dateWiseFileSearchProcessGraph,
    dateWiseFileSearchProcessGraphWithUser,
    completionDateWiseGraph,
    completionDateWiseGraphWithUser,
    completionDateWiseProcessGraph,
    completionDateWiseProcessGraphWithUser,
    completionDateWiseFileSearchGraph,
    completionDateWiseFileSearchGraphWithUser,
    completionDateWiseFileSearchProcessGraph,
    completionDateWiseFileSearchProcessGraphWithUser
}