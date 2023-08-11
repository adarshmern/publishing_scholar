const { efficiencyGraphOne, efficiencyGraphTwo } = require('../../helpers/pubskolerHelper');
const RawData = require('../../models/manuSchema');

function timeToMinutes(timeString) {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 60 + minutes + seconds / 60;
}


function calculateEfficiency(standardPages, standardTimeMinutes, actualPages, actualTimeMinutes) {
    const standardRate = standardPages / standardTimeMinutes;
    const actualRate = actualPages / actualTimeMinutes;
    const efficiency = (actualRate / standardRate);

    return efficiency*100;
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



const getAllGraphs=async(req,res)=>{
    try {
        console.log(req.body);
        if(req.body.type=='normal'){
            delete req.body.type;
            const result =await efficiencyGraphOne(req.body);
            return res.status(200).json(result);
        }else{
            delete req.body.type;
            const result =await efficiencyGraphTwo(req.body);
            return res.status(200).json(result);
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
}


module.exports = {
    addData,
    getUsers,
    getAllGraphs
}