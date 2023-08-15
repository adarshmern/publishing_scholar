import React, { useEffect, useState } from 'react';
import * as XLSX from "xlsx";
import axios from '../../utils/axios';
import {
    INSERT_DATA,
    LIST_USERS,
    GRAPH_ONE,
    GRAPH_TWO,
    GRAPH_ONE_USER,
    GRAPH_TWO_USER,
    COMPLETION_DATE_GRAPH_ONE,
    COMPLETION_DATE_GRAPH_ONE_USER,
    COMPLETION_DATE_GRAPH_TWO,
    COMPLETION_DATE_GRAPH_TWO_USER,
    FILE_SEARCH_GRAPH_ONE,
    FILE_SEARCH_GRAPH_ONE_USER,
    FILE_SEARCH_GRAPH_TWO,
    FILE_SEARCH_GRAPH_TWO_USER,
    GGRAPH_ONE,
    GGRAPH_TWO,
    GRAPH
} from '../../utils/API';
import GraphCompOne from '../../components/Charts/FirstGraph'
import GraphCompTwo from '../../components/Charts/SecondGraph'
import { useDispatch, useSelector } from 'react-redux';
import { setUserBasedData } from '../../redux/apiSlice';
import Filter from '../../components/modal/Filter';
import { FaFilter } from 'react-icons/fa'
import { setFileName } from '../../redux/filenameSlice';

function Upload() {
    const dataUser = useSelector(state => state.api.data)
    const dispatch = useDispatch()
    const [startDate, setStartDate] = useState('2023-06-01');
    const [endDate, setEndDate] = useState('2023-06-30');
    const [users, setUsers] = useState([]);
    const [user, setUSer] = useState('');
    const [key, setkey] = useState('')
    // const key = useSelector(state=>state.name)
    const [fileData, setFileData] = useState([])
    const [flag, setFlag] = useState(false)
    const [showModal, setShowModal] = useState(false);

    const [landingDataOne, setlandingDataOne] = useState([])
    const [processData, setprocessData] = useState([])

    const [selectCompletion, setselectCompletion] = useState(false)
    const [selectFilename, setselectFilename] = useState(false)


    useEffect(() => {
        getAllUsers()
        getLandingData()
        processWiseData()
    }, [flag])


    async function getLandingData() {
        const body={
            type:'one',
        }
        if(selectCompletion){
            body['completionRangeStart']=startDate
            body['completionRangeEnd']=endDate
        }else{
            body['processRangeStart']=startDate
            body['processRangeEnd']=endDate
        }
        if(user){
            body['user']=user
        }
        if(key){
            body['key']=key
        }
        axios.post(GRAPH,body).then(res=>{
            console.log(res.data);
            setlandingDataOne(res.data)
        }).catch(err=>console.log(err.message))
    }

    async function processWiseData() {
        const body={
            type:'two',
        }
        if(selectCompletion){
            body['completionRangeStart']=startDate
            body['completionRangeEnd']=endDate
        }else{
            body['processRangeStart']=startDate
            body['processRangeEnd']=endDate
        }
        if(user){
            body['user']=user
        }
        if(key){
            body['key']=key
        }
        axios.post(GRAPH,body).then(res=>{
            console.log(res.data);
            setprocessData(res.data)
        }).catch(err=>console.log(err.message))
    }

    async function getAllUsers() {
        axios.get(LIST_USERS).then((res) => {
            setUsers(res.data);
        })
    }

    async function handleuserchange(e) {
        setUSer(e.target.value);
        setFlag(prev => !prev);
    }

    const readUploadFile = (e) => {
        e.preventDefault();
        if (e.target.files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                json.forEach(async (elem) => {
                    console.log(elem);
                    axios.post(INSERT_DATA, elem).then(() => {
                    }).catch((err) => {
                        console.log(err.message);
                    })
                })
            };
            reader.readAsArrayBuffer(e.target.files[0]);
        }
    }


    function handlestartDt(e) {
        setStartDate(e.target.value);
        setFlag(prev => !prev);
    }

    function handleendDt(e) {
        setEndDate(e.target.value)
        setFlag(prev => !prev)
    }

    function handleCloseModal() {
        setShowModal(false);
    }

    // function handleFilenameChange(e) {
    //     setkey(e.target.value);
    //     // dispatch(setFileName(e.target.value))
    //     console.log(key);
    //     if (key === '') setselectFilename(true)
    //     else setselectFilename(false)
    //     setFlag(prev => !prev);
    // }

    function handleFilenameChange(e) {
        setkey(e.target.value);
        if (e.target.value === '') {
            setselectFilename(true);
        } else {
            setselectFilename(false);
        }
        setFlag(prev => !prev);
    }
    

    function handleDateFilter() {
        setselectCompletion(prev => !prev)
        setFlag(prev => !prev)
    }

    return (
        <>
            <div className="card" >
                <div className="card-body" >
                    <form>
                        <label htmlFor="upload">Upload File</label>
                        <br />
                        <input
                            type="file"
                            name="upload"
                            id="upload"
                            onChange={readUploadFile}
                        />
                    </form>
                </div>
            </div>
            <br />
            <div className="col">
                <button style={{ backgroundColor: "blue" }} onClick={() => setShowModal(true)}><FaFilter />Filter</button>
            </div>
            {showModal && <Filter
                users={users}
                handleuserchange={handleuserchange}
                onClose={handleCloseModal}
                handlestartDt={handlestartDt}
                handleendDt={handleendDt}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                handleFilenameChange={handleFilenameChange}
                handleDateFilter={handleDateFilter}
                selectCompletion={selectCompletion}
                user={user}
                keyInput={key}
            />}
            <br />
            {user ? <h4>Efficiencies per Date For {user}</h4> : <h4>Efficiencies per Date </h4>}
            <div className='card' style={{ width: "1500px" }} >
                <GraphCompOne data={landingDataOne} />
            </div>
            {user ? <h4>Efficiencies per Date Process Wise For {user}</h4> : <h4>Efficiencies per Date Process Wise</h4>}
            <div className='card' style={{ width: "1500px" }} >
                <GraphCompTwo data={processData} />
            </div>
        </>
    );
}

export default Upload;