import React, { useRef } from 'react'
import './filter.css'

const Filter = ({ onClose, setFlag,handleendDt,handlestartDt, users,handleuserchange ,endDate,startDate,setStartDate,setEndDate}) => {

    function handleClose(e) {
        if (e.target.id === 'editModal') {
            onClose()
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        onClose()
    }
    return (
        <div id='editModal' onClick={handleClose} className="modal">
            <div className="modal-content">
                <form onSubmit={handleSubmit} >
                    <div className="row">
                        <div className="col-6">
                        <input defaultValue={startDate} type="date" onChange={(e) => handlestartDt(e)} />
                        </div>
                        <div className="col-6">
                        <input defaultValue={endDate} type="date" onChange={(e) => handleendDt(e)} />
                        </div>
                    </div>
                    <div className="row">
                        <select name="username" id="username" onChange={(e) => handleuserchange(e)}>
                            {users.map((username, index) => (
                                <option key={index} value={username}>
                                    {username}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type='submit'>Apply</button>
                </form>
            </div>
        </div>
    )
}

export default Filter