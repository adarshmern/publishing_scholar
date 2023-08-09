const RawData = require('../../models/manuSchema');

function timeToMinutes(timeString) {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 60 + minutes + seconds / 60;
}

const insertData = async (req, res) => {
    try {
        console.log(req.body);
        let {
            'File Name': filename,
            'Page count': pg_count,
            'Import Date': imp_date,
            'Job Study By': job_study_by,
            'JobStudy Start Date': js_dt,
            'JobStudy Start Time': js_tm,
            'JobStudy Completed Date': js_edt,
            'JobStudy End Time': js_et,
            'Structuring By': structuring_by,
            'Structuring Start Date': st_dt,
            'Structuring Start Time': st_tm,
            'Structuring Completed Date': st_edt,
            'Structuring End Time': st_et,
            'PE By': pre_editing_by,
            'Pre-Editing Start Date': pe_dt,
            'Pre-Editing Start Time': pe_tm,
            'Pre-Editing Completed Date': pe_edt,
            'Pre-Editing End Time': pe_et,
            'Pre-Editing Productive Time': pe_prod_time,
            'CE By': copy_editing_by,
            'CopyEditing Start Date': ce_dt,
            'CopyEditing Start Time': ce_tm,
            'CopyEditing Completed Date': ce_edt,
            'CopyEditing End Time': ce_et,
            'CopyEditing Productive Time': ce_prod_time,
            'EPR By': epr_by,
            'EPR Start Date': epr_dt,
            'EPR Start Time': epr_tm,
            'EPR Completed Date': epr_edt,
            'EPR End Time': epr_et,
            'Archival Date': arch_date
        } = req.body
        const peExist = await PEModel.findOne({ filename });
        const ceExist = await CEModel.findOne({ filename });
        const eprExist = await EPRModel.findOne({ filename });
        if (peExist || ceExist || eprExist) return res.status(400).json({ message: "filename already entered" });
        const newPE = new PEModel({
            filename,
            import: imp_date,
            start: pe_dt + ' ' + pe_tm,
            end: pe_edt + ' ' + pe_et,
            user: pre_editing_by,
            completion_Date: arch_date
        })
        const pe_minutes = timeToMinutes(pe_prod_time);
        newPE.efficiency = (((pg_count / (200 / 480)) / pe_minutes) * 100).toFixed(2)
        newPE.duration = newPE.end - newPE.start,
            await newPE.save()
        const newCE = new CEModel({
            filename,
            import: imp_date,
            start: ce_dt + ' ' + ce_tm,
            end: ce_edt + ' ' + ce_et,
            user: copy_editing_by,
            completion_Date: arch_date
        })
        const ce_minutes = timeToMinutes(ce_prod_time);
        newCE.efficiency = (((pg_count / (200 / 480)) / ce_minutes) * 100).toFixed(2)
        newCE.duration = newCE.end - newCE.start;
        await newCE.save();
        const newEPR = new EPRModel({
            filename,
            import: imp_date,
            start: epr_dt + ' ' + epr_tm,
            end: epr_edt + ' ' + epr_et,
            user: epr_by,
            completion_Date: arch_date
        })
        newEPR.duration = newEPR.end - newEPR.start;
        await newEPR.save();

        const processes = [];
        if (pe_dt) processes.push('PreEditing');
        if (ce_dt) processes.push('CopyEditing');
        if (epr_dt) processes.push('EPR');

        const newManuscript = new ManuscriptModel({
            filename,
            process: processes,
            importDate: imp_date
        });
        await newManuscript.save();
        res.status(200).json('respo');
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message })
    }
}

function calculateEfficiency(standardPages, standardTimeMinutes, actualPages, actualTimeMinutes) {
    const standardRate = standardPages / standardTimeMinutes;
    const actualRate = actualPages / actualTimeMinutes;
    const efficiency = (actualRate / standardRate);

    return efficiency;
}

const addData = async (req, res) => {
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
        } = req.body
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
            page_count: pg_count,
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
            page_count: pg_count,
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

        // const newEPR = {
        //     processName: 'EPR',
        //     user: epr_by,
        //     startTime: new Date(`${epr_dt} ${epr_tm}`),
        //     endTime: new Date(`${epr_edt} ${epr_et}`),
        //     duration: new Date(),
        //     efficiency: 0,
        // };
        // newEPR.duration = new Date(newEPR.endTime) - new Date(newEPR.startTime);
        // newEPR.efficiency = (((pg_count / (200 / 480)) / (newEPR.duration / 60000)) * 100).toFixed(2);
        // tTime += newEPR.duration;
        // processArray.push(newEPR);
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
        const newData = new RawData({
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

        res.status(200).json({ message: 'Data added successfully.' });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}


const getUsers = async (req, res) => {
    try {
        const distinctUsernames = await RawData.distinct('process.user');
        res.status(200).json(distinctUsernames);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}


const graphDefDayOne = async (req, res) => {
    try {
        const startDate = new Date(req.query.startingDate);
        const endDate = new Date(req.query.endingDate);
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
        res.json(result)
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}

const graphDefDayOneUser = async (req, res) => {
    try {
        const startDate = new Date(req.query.startingDate);
        const endDate = new Date(req.query.endingDate);
        const user = req.query.username;
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

        res.json(result)
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}

const graphDefDayOneProcess = async (req, res) => {
    try {
        const startDate = new Date(req.query.startingDate);
        const endDate = new Date(req.query.endingDate);
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
                            // efficiency: { $avg: "$totalEfficiency" },
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


        res.json(result)
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}

const graphDefDayOneProcessUser = async (req, res) => {
    try {
        const startDate = new Date(req.query.startingDate);
        const endDate = new Date(req.query.endingDate);
        const user = req.query.username;
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
                            // efficiency: { $avg: "$totalEfficiency" },
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
        res.json(result)
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}

const fileSearchFilterGraphOne = async (req, res) => {
    try {
        const startDate = new Date(req.query.startingDate);
        const endDate = new Date(req.query.endingDate);
        const key = req.query.key; 
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
        res.json(result);

    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}

const fileSearchFilterGraphOneUser = async (req, res) => {
    try {
        const startDate = new Date(req.query.startingDate);
        const endDate = new Date(req.query.endingDate);
        const key = req.query.key; 
        const user = req.query.username;
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
        res.json(result);

    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}

const searchgraphDefDayOneProcess = async (req, res) => {
    try {

        const startDate = new Date(req.query.startingDate);
        const endDate = new Date(req.query.endingDate);
        const key = req.query.key; 
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
                            // efficiency: { $avg: "$totalEfficiency" },
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


        res.json(result)
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}

const searchgraphDefDayOneProcessUser = async (req, res) => {
    try {
        const startDate = new Date(req.query.startingDate);
        const endDate = new Date(req.query.endingDate);
        const user = req.query.username;
        const key = req.query.key; 
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
                            // efficiency: { $avg: "$totalEfficiency" },
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
        res.json(result)
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}

const filecompletionFilterGraphOne = async (req, res) => {
    try {
        const startDate = new Date(req.query.startingDate);
        const endDate = new Date(req.query.endingDate);
        

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
        res.json(result);

    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}

const filecompletionFilterGraphOneUser = async (req, res) => {
    try {
        const startDate = new Date(req.query.startingDate);
        const endDate = new Date(req.query.endingDate);
        
        const user = req.query.username;
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
        res.json(result);

    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}

const completiongraphDefDayOneProcess = async (req, res) => {
    try {

        const startDate = new Date(req.query.startingDate);
        const endDate = new Date(req.query.endingDate);
        

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
                            // efficiency: { $avg: "$totalEfficiency" },
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


        res.json(result)
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}

const completiongraphDefDayOneProcessUser = async (req, res) => {
    try {
        const startDate = new Date(req.query.startingDate);
        const endDate = new Date(req.query.endingDate);
        const user = req.query.username;
        
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
                            // efficiency: { $avg: "$totalEfficiency" },
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
        res.json(result)
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    insertData,
    addData,
    getUsers,
    graphDefDayOne,
    graphDefDayOneUser,
    graphDefDayOneProcess,
    graphDefDayOneProcessUser,
    fileSearchFilterGraphOne,
    fileSearchFilterGraphOneUser,
    searchgraphDefDayOneProcess,
    searchgraphDefDayOneProcessUser,
    filecompletionFilterGraphOne,
    filecompletionFilterGraphOneUser,
    completiongraphDefDayOneProcess,
    completiongraphDefDayOneProcessUser
}