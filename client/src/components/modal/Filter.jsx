import React, { useRef, useState } from 'react';
import './filter.css';

const Filter = ({
    onClose,
    setFlag,
    handleendDt,
    handlestartDt,
    users,
    handleuserchange,
    endDate,
    startDate,
    handleFilenameChange,
    handleDateFilter,
    setStartDate,
    setEndDate,
    selectCompletion,
    user,
    keyInput
}) => {





    function handleClose(e) {
        if (e.target.id === 'editModal') {
            onClose();
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        onClose();
    }


    return (
        <div id='editModal' onClick={handleClose} className='modal'>
            <div className='modal-content'>
                <button onClick={()=>location.reload()}>default graph</button>
                <form onSubmit={handleSubmit}>
                    <div className='row'>
                        <div className='col-6'>
                            <input
                                defaultValue={startDate}
                                type='date'
                                onChange={(e) => handlestartDt(e)}
                            />
                        </div>
                        <div className='col-6'>
                            <input
                                defaultValue={endDate}
                                type='date'
                                onChange={(e) => handleendDt(e)}
                            />
                        </div>
                    </div>
                    <div className='row'>
                        <select
                            name='username'
                            id='username'
                            
                            onChange={(e) => handleuserchange(e)}
                        >
                            <option selected>{user}</option>
                            {users.map((username, index) => (
                                <option key={index} value={username}>
                                    {username}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='row'>

                        <div className='col'> <input
                            type='text'
                            placeholder='type filenaem'
                            value={keyInput}
                            onChange={e => handleFilenameChange(e)}
                        />
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-6'>
                            <label>
                                <input
                                    type='checkbox'
                                    style={{ height: '30px' }}
                                    name='checkbox'
                                    checked={selectCompletion}
                                    onChange={handleDateFilter}
                                />
                                Filter by Completion Date
                            </label>
                        </div>
                    </div>
                    <button type='submit'>Close</button>
                </form>
            </div>
        </div>
    );
};

export default Filter;
