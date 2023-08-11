const mongoose = require('mongoose');

const processSchema = mongoose.Schema({
    processName: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    duration: {
        type: Number,
        required: true
    },
    process_productive_time:{
        type: Number,
        required: true
    },
    process_total_time:{
        type: Number,
        required: true
    },
    process_estimated_time:Number,
    process_target_pages:Number,
    efficiency: {
        type: Number
    }
})


const rawDataSchema = mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    importDate: {
        type: Date,
        required: true,
    },
    process: [processSchema],
    completion_Date: {
        type: Date,
        required: true,
    },
    page_count: {
        type: Number,
    },
    figure_count: {
        type: Number,
    },
    table_count: {
        type: Number,
    },
    reference_count: {
        type: Number,
    },
    duplicates_count: {
        type: Number,
    },
    queries_count: {
        type: Number,
    },
    journals_count: {
        type: Number,
    },
    book_count: {
        type: Number,
    },
    edited_book_count: {
        type: Number,
    },
    other_ref_count: {
        type: Number,
    },
    totalTime: {
        type: Number,
    }
})



module.exports = mongoose.model('manuscript', rawDataSchema);