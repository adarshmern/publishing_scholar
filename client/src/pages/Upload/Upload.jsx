import React, { useEffect, useState } from 'react';
import * as XLSX from "xlsx";
import axios from '../../utils/axios';
import { ADD_DATA, INSERT_DATA, DEFAULT_GRAPH, LIST_USERS, USER_BASED_GRAPH, FILE_GRAPH ,USER_GRAPH,FILE_BASED_GRAPH} from '../../utils/API';
import DisplayChart from '../../components/Home/Display';
import BarChartComponent from '../../components/Charts/DefaultChart';
import GroupedBarChart from '../../components/Charts/UserBasedChart';
import FileBased from '../../components/Charts/FileBasedChart';
import { useDispatch, useSelector } from 'react-redux';
import { setUserBasedData } from '../../redux/apiSlice';
import Filter from '../../components/modal/Filter';
import {FaFilter} from 'react-icons/fa'

function Upload() {
    const dataUser = useSelector(state=>state.api.data)
    const dispatch = useDispatch()
    const [defaultG, setDefaultG] = useState([])
    const [startDate, setStartDate] = useState('2023-06-01');
    const [endDate, setEndDate] = useState('2023-07-10');
    const [users, setUsers] = useState([]);
    const [user, setUSer] = useState('');
    const [userBasedGraphData, setUserBasedGraphData] = useState([])
    const [filename, setFilename] = useState('')
    const [fileData, setFileData] = useState([])
    const [flag, setFlag] = useState(false)
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        getAllUsers()
        getDefaultGraph()
        getUserGroupedData()
    }, [flag])

    useEffect(()=>{

    },[userBasedGraphData])

    async function getDefaultGraph() {
        await axios.get(`${DEFAULT_GRAPH}?startDate=${startDate}&endDate=${endDate}`).then((res) => {
            console.log(res.data);
            setDefaultG(res.data);
        })
    }

    async function getAllUsers() {
        await axios.get(LIST_USERS).then((res) => {
            setUsers(res.data);
        })
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
                    await axios.post(INSERT_DATA, elem).then(() => {
                    }).catch((err) => {
                        console.log(err.message);
                    })
                })

                console.log(json);
            };
            reader.readAsArrayBuffer(e.target.files[0]);
        }
    }

    async function handleuserchange(e) {
        console.log(e.target.value);
        setUSer(e.target.value);
        setFlag(prev => !prev);
    }


    async function getUserGroupedData() {
        axios.get(`${USER_GRAPH}?username=${user}&startDate=${startDate}&endDate=${endDate}`).then(res => {
            console.log(res.data);
            // setUserBasedGraphData(()=>{return res.data});
            console.log(dataUser);
            dispatch(setUserBasedData({ data: res.data }))
        })
    }

    async function getFIleBasedGraph(e) {
        e.preventDefault()
        axios.get(`${FILE_BASED_GRAPH}?filename=${filename}&startDate=${startDate}&endDate=${endDate}`).then(res => {
            console.log(res.data);
            setFileData(res.data)
        })
    }

    function handlestartDt(e) {
        console.log(e.target.value);
        setStartDate(e.target.value);
        setFlag(prev => !prev);
    }

    function handleendDt(e) {
        console.log(e.target.value);
        setEndDate(e.target.value)
        setFlag(prev => !prev)
    }

    async function handlefilenamechange(e) {
        setFilename(e.target.value);
    }

    function handleOpenModal() {
        setShowModal(true);
      }
    
      function handleCloseModal() {
        setShowModal(false);
      }

    return (
        <>

            <div className="card" style={{ width: "100%" }}>
                <div className="card-body" style={{ width: "100%" }}>
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
                <button style={{backgroundColor:"blue"}} onClick={()=>setShowModal(true)}><FaFilter />Filter</button>
            </div>
            {showModal&&<Filter 
            users={users} 
            handleuserchange={handleuserchange} 
            onClose={handleCloseModal}
            handlestartDt={handlestartDt}
            handleendDt={handleendDt}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            />}
            <br />
            <div className="row"></div>
            <div className="card" style={{ width: "100%" }}>
                <BarChartComponent data={defaultG} />
            </div>
            <div className="card" style={{ width: "100%" }}>
               {dataUser&& <GroupedBarChart data={dataUser} />}
            </div>
            {/* <form onSubmit={getFIleBasedGraph}>
                <input type="text" name="" id="" onChange={e => handlefilenamechange(e)} />
                <button type="submit">VIEW CHART</button>
            </form> */}

            {/* <div className="card" style={{ width: "100%" }}>
                <FileBased data={fileData} />
            </div> */}
        </>
    );
}

export default Upload;