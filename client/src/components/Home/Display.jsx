import React from 'react'
import Chartd3 from './Graph';

function DisplayChart() {

    const data = [
        { group: 'Group 1', value1: 10, value2: 15, value3: 8 },
        { group: 'Group 2', value1: 12, value2: 9, value3: 5 },
        { group: 'Group 3', value1: 8, value2: 10, value3: 12 },
      ];
  return (
    <div>
      <Chartd3 data ={data} />
    </div>
  )
}

export default DisplayChart