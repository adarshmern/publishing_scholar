// import React from 'react';
// import Chart from 'react-apexcharts';

// const processData = (data) => {
//   const processedData = {};
//   const processNames = new Set();

//   data.forEach(entry => {
//     const { date, processName, efficiency } = entry;
//     processNames.add(processName);

//     if (!processedData[date]) {
//       processedData[date] = {};
//     }

//     processedData[date][processName] = efficiency;
//   });

//   const categories = Object.keys(processedData);
//   const series = Array.from(processNames).map(processName => ({
//     name: processName,
//     data: categories.map(date => processedData[date][processName] || 0)
//   }));

//   return {
//     categories,
//     series
//   };
// };

// const ChartComponent = ({ data }) => {
//   const { categories, series } = processData(data);

//   const options = {
//     chart: {
//       type: 'bar',
//       stacked: false,
//       height: 350,
//       events: {
//         dataPointSelection: function(event, chartContext, config) {
//           console.log(config.dataPointIndex);
//         }
//       }
//     },
//     xaxis: {
//       categories: categories,
//       labels: {
//         rotate: -45,
//         style: {
//           fontSize: '13px'
//         }
//       }
//     },
//     yaxis: {
//       title: {
//         text: 'Efficiency'
//       }
//     },
//     fill: {
//       opacity: 1
//     },
//     legend: {
//       position: 'top',
//       horizontalAlign: 'left',
//       offsetX: 40
//     }
//   };

//   return (
//     <Chart options={options} series={series} type="bar" height={350} />
//   );
// };

// export default ChartComponent;


import React from 'react';
import ReactApexChart from 'react-apexcharts';

const ApexChart = ({ data }) => {
  const groupedChartData = data.map(entry => ({
    date: entry.date,
    preEditing: entry.preEditing,
    copyEditing: entry.copyEditing,
    epr: entry.epr
  }));

  const categories = groupedChartData.map(entry => entry.date);

  const series = [
    {
      name: 'Pre Editing',
      data: groupedChartData.map(entry => entry.preEditing)
    },
    {
      name: 'Copy Editing',
      data: groupedChartData.map(entry => entry.copyEditing)
    },
    {
      name: 'EPR',
      data: groupedChartData.map(entry => entry.epr)
    }
  ];

  const options = {
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: categories,
      title: {
        text: 'Dates'
      }
    },
    yaxis: {
      title: {
        text: 'Efficiency'
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toFixed(2);
        }
      }
    }
  };

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="bar" height={350} />
    </div>
  );
}

export default ApexChart;
