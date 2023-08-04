// const PEModel = require('../../models/preEditingSchema');
// const CEModel = require('../../models/copyEditingSchema');
// const EPRModel = require('../../models/EPRSchema');
// const ManuscriptModel = require('../../models/manuscriptSchema');
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

const displayData = async (req, res) => {
    try {
        const { start, end } = req.query;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const result = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const day = currentDate.getDate();
            const peDocuments = await PEModel.find({
                import: { $gte: new Date(currentDate), $lt: new Date(currentDate.getTime() + (24 * 60 * 60 * 1000)) }
            });
            const ceDocuments = await CEModel.find({
                import: { $gte: new Date(currentDate), $lt: new Date(currentDate.getTime() + (24 * 60 * 60 * 1000)) }
            });
            const peEfficiency = peDocuments.length > 0 ? peDocuments.reduce((sum, doc) => sum + doc.efficiency, 0) / peDocuments.length : 0;
            const ceEfficiency = ceDocuments.length > 0 ? ceDocuments.reduce((sum, doc) => sum + doc.efficiency, 0) / ceDocuments.length : 0;
            const averageEfficiency = (peEfficiency + ceEfficiency) / 2;
            result.push({ day, efficiency: averageEfficiency });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        res.status(200).json(result);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
};

const addData = async (req, res) => {
    try {
        // console.log(req.body);
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
        const processArray = [];
        let tTime = 0;
        // const newJS = {
        //     processName: 'Job Study',
        //     user: job_study_by,
        //     startTime: new Date(`${js_dt} ${js_tm}`),
        //     endTime: new Date(`${js_edt} ${js_et}`),
        //     duration: Date(),
        //     efficiency: 0,
        // };
        // newJS.duration = new Date(newJS.endTime) - new Date(newJS.startTime);
        // tTime += newJS.duration;
        // processArray.push(newJS);

        // const newStructuring = {
        //     processName: 'Structuring',
        //     user: structuring_by,
        //     startTime: new Date(`${st_dt} ${st_tm}`),
        //     endTime: new Date(`${st_edt} ${st_et}`),
        //     duration: Date(),
        //     efficiency: 0,
        // };
        // newStructuring.duration = new Date(newStructuring.endTime) - new Date(newStructuring.startTime);
        // tTime += newStructuring.duration;
        // processArray.push(newStructuring);

        const newPE = {
            processName: 'Pre Editing',
            user: pre_editing_by,
            startTime: new Date(`${pe_dt} ${pe_tm}`),
            endTime: new Date(`${pe_edt} ${pe_et}`),
            duration: new Date(),
            efficiency: 0,
        };
        newPE.duration = new Date(newPE.endTime) - new Date(newPE.startTime);
        tTime += newPE.duration;
        const pe_minutes = timeToMinutes(pe_prod_time);
        newPE.efficiency = (((pg_count / (200 / 480)) / (newPE.duration / 60000)) * 100).toFixed(2);

        processArray.push(newPE);

        const newCE = {
            processName: 'Copy Editing',
            user: copy_editing_by,
            startTime: new Date(`${ce_dt} ${ce_tm}`),
            endTime: new Date(`${ce_edt} ${ce_et}`),
            duration: new Date(),
            efficiency: 0,
        };
        newCE.duration = new Date(newCE.endTime) - new Date(newCE.startTime);
        tTime += newCE.duration;
        const ce_minutes = timeToMinutes(ce_prod_time);
        // newCE.efficiency = (((pg_count / (200 / 480)) / ce_minutes) * 100).toFixed(2);
        newCE.efficiency = (((pg_count / (200 / 480)) / (newCE.duration / 60000)) * 100).toFixed(2);

        processArray.push(newCE);

        const newEPR = {
            processName: 'EPR',
            user: epr_by,
            startTime: new Date(`${epr_dt} ${epr_tm}`),
            endTime: new Date(`${epr_edt} ${epr_et}`),
            duration: new Date(),
            efficiency: 0,
        };
        newEPR.duration = new Date(newEPR.endTime) - new Date(newEPR.startTime);
        newEPR.efficiency = (((pg_count / (200 / 480)) / (newEPR.duration / 60000)) * 100).toFixed(2);
        tTime += newEPR.duration;
        processArray.push(newEPR);
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


const getGraph = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);

        let result = await RawData.aggregate([
            {
                $match: {
                    completion_Date: {
                        $gte: startDateObj,
                        $lte: endDateObj,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$completion_Date' },
                        month: { $month: '$completion_Date' },
                        day: { $dayOfMonth: '$completion_Date' },
                    },
                    date: {
                        $first: '$completion_Date',
                    },
                    duration: {
                        $sum: '$totalTime',
                    },
                    pageCount: {
                        $sum: '$page_count',
                    },
                },
            },
            {
                $match: {
                    date: { $exists: true }
                },
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%dT00:00:00.000Z',
                            date: '$date',
                        },
                    },
                    duration: 1,
                    pageCount: 1,
                },
            },
            {
                $sort: {
                    date: 1
                }
            }
        ]);
        result.forEach((elem) => {
            elem.efficiency = ((elem.pageCount / (200 / 480) / (elem.duration / (60000))) * 100).toFixed(2)
            elem.date = `${new Date(elem.date).getDate()}/` + `${new Date(elem.date).getMonth()}`;
        })
        res.status(200).json(result);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}

const getFileGraph = async (req, res) => {
    try {
        const filename = req.query.filename;
        await RawData.aggregate([
            {
                $match: {
                    filename: filename,
                },
            },
            {
                $unwind: '$process',
            },
            {
                $group: {
                    _id: '$process.processName',
                    duration: { $sum: '$process.duration' },
                },
            },
            {
                $project: {
                    _id: 0,
                    processName: '$_id',
                    duration: 1,
                },
            },
        ])
            .then((results) => {
                res.json(results);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}

const getUserGraph = async (req, res) => {
    try {
        const username = req.query.username;
        const pipeline = [
            {
                $match: {
                    'process.user': username,
                },
            },
            {
                $unwind: '$process',
            },
            {
                $match: {
                    'process.user': username,
                },
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$process.startTime' } },
                        processName: '$process.processName',
                    },
                    totalDuration: { $sum: '$process.duration' },
                    pageCount: { $sum: '$page_count' },
                },
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    processName: '$_id.processName',
                    totalDuration: 1,
                    pageCount: 1,
                },
            },
        ];
        await RawData.aggregate(pipeline)
            .then((results) => {
                const graphData = {};
                results.forEach((result) => {
                    const { date, processName, totalDuration, pageCount } = result;
                    if (!graphData[date]) {
                        graphData[date] = [];
                    }
                    graphData[date].push({
                        processName,
                        totalDuration,
                        pageCount,
                        efficiency: Number((pageCount / (150 / 480) / (totalDuration / (60000)) * 100).toFixed(2))
                    });
                });
                res.json(Object.entries(graphData));
            })
            .catch((error) => {
                console.error('Error:', error);
            });
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


const getUserProcessData = async (req, res) => {
    try {
        const { startDate, endDate, username } = req.query;

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);

        const result = await RawData.aggregate([
            {
                $match: {
                    completion_Date: {
                        $gte: startDateObj,
                        $lte: endDateObj,
                    },
                    'process.user': username,
                },
            },
            {
                $unwind: '$process',
            },
            // {
            //     $match: {
            //         'process.user': username,
            //     },
            // },
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: {
                                format: '%Y-%m-%dT00:00:00.000Z',
                                date: '$completion_Date',
                            },
                        },
                        processName: '$process.processName',
                    },
                    pageCount: {
                        $sum: '$page_count',
                    },
                    filename: {
                        $first: "$filename"
                    },
                    efficiency: {
                        $first: '$process.efficiency',
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    processName: '$_id.processName',
                    pageCount: 1,
                    filename: 1,
                    efficiency: 1
                },
            },
            {
                $sort: {
                    date: 1,
                    processName: 1,
                },
            },
        ]);
        // result.forEach((elem) => {
        //     elem.efficiency = Number(Number((elem.pageCount / (200 / 480) / (elem.duration / 60000) )* 100).toFixed(2))
        //     elem.date = `${new Date(elem.date).getDate()}/` + `${new Date(elem.date).getMonth()}`;
        // })
        // console.log(result);
        // res.status(200).json(result);

        const groupedData = {};

        result.forEach(entry => {
            const date = new Date(entry.date).toISOString().split('T')[0];

            if (!groupedData[date]) {
                groupedData[date] = {
                    date: date,
                    copyEditing: [],
                    epr: [],
                    preEditing: []
                };
            }

            if (entry.processName === "Copy Editing") {
                groupedData[date].copyEditing.push(entry.efficiency);
            } else if (entry.processName === "EPR") {
                groupedData[date].epr.push(entry.efficiency);
            } else if (entry.processName === "Pre Editing") {
                groupedData[date].preEditing.push(entry.efficiency);
            }
        });

        const groupedChartData = Object.values(groupedData).map(entry => {
            return {
                date: entry.date,
                copyEditing: entry.copyEditing.reduce((sum, val) => sum + val, 0) / entry.copyEditing.length,
                epr: entry.epr.reduce((sum, val) => sum + val, 0) / entry.epr.length,
                preEditing: entry.preEditing.reduce((sum, val) => sum + val, 0) / entry.preEditing.length
            };
        });

        console.log(groupedChartData);
        res.status(200).json(groupedChartData)
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}


const getFileProcessData = async (req, res) => {
    try {
        const { startDate, endDate, filename } = req.query;

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);

        const result = await RawData.aggregate([
            {
                $match: {
                    completion_Date: {
                        $gte: startDateObj,
                        $lte: endDateObj,
                    },
                    filename: filename,
                },
            },
            {
                $unwind: '$process',
            },
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: {
                                format: '%Y-%m-%dT00:00:00.000Z',
                                date: '$completion_Date',
                            },
                        },
                        processName: '$process.processName',
                    },
                    pageCount: {
                        $sum: '$page_count',
                    },
                    duration: {
                        $sum: '$process.duration',
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    processName: '$_id.processName',
                    pageCount: 1,
                    duration: 1,
                },
            },
            {
                $sort: {
                    date: 1,
                    processName: 1,
                },
            },
        ]);
        result.forEach((elem) => {
            elem.efficiency = Number(Number((elem.pageCount / (200 / 480) / (elem.duration / 60000)) * 100).toFixed(2))
            elem.date = `${new Date(elem.date).getDate()}/` + `${new Date(elem.date).getMonth() + 1}`;
        })
        res.status(200).json(result);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}

const getProcessWiseData = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);

        const processOrder = ['copyEditing', 'epr', 'preEditing']; 


        const result = await RawData.aggregate([
            {
                $match: {
                    "completion_Date": { $gte: startDateObj, $lte: endDateObj }
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
                    averageEfficiency: { $avg: "$process.efficiency" }
                }
            },
            {
                $group: {
                    _id: "$_id.date",
                    efficiencies: {
                        $push: {
                            processName: "$_id.processName",
                            averageEfficiency: "$averageEfficiency"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    efficiencies: 1
                }
            },
            {
                $sort:{
                    date:1
                }
            }
        ])

        //   const formattedResult = result.map(item => {
        //     const formattedItem = { date: item.date };
        //     item.efficiencies.forEach(processEfficiency => {
        //       formattedItem[processEfficiency.processName.toLowerCase().replace(' ', '')] = processEfficiency.averageEfficiency;
        //     });
        //     return formattedItem;
        //   });

        const formattedResult = result.map(item => {
            const formattedItem = { date: item.date };
            item.efficiencies.forEach(processEfficiency => {
                formattedItem[processEfficiency.processName.toLowerCase().replace(' ', '')] = parseFloat(processEfficiency.averageEfficiency.toFixed(2));
            });
            return formattedItem;
        });
        formattedResult.forEach(elem=>{
            console.log(elem.epr,typeof(elem.epr));
            if(elem.epr==Infinity){
                elem.epr=0;
            }
        })
        const reorderedData = formattedResult.map(item => {
            return {
                "date": item.date,
                "copyEditing": item.copyediting,
                "epr": item.epr,
                "preEditing": item.preediting
            };
        });
        res.status(200).json(reorderedData)
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    insertData,
    displayData,
    addData,
    getGraph,
    getUserGraph,
    getFileGraph,
    getUsers,
    getUserProcessData,
    getFileProcessData,
    getProcessWiseData
}