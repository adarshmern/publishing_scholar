import React, { useEffect } from 'react';
import Chart from 'react-apexcharts';

const EfficiencyChart = ({ data }) => {

  useEffect(()=>{
    console.log(data);
  })

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      title: {
        text: 'Efficiency',
      },
    },
    tooltip: {
      y: {
        formatter: (value, { dataPointIndex }) => {
          const pagecount = data[dataPointIndex].pageCount;
          const workbookCount = data[dataPointIndex].workbookCount;
          const efficiency = value.toFixed(2);
          return `Efficiency: ${efficiency} \n Page Count: ${pagecount} \n Workbook Count: ${workbookCount}`;
        },
      },
    },
    plotOptions: {
      bar: {
        dataLabels: {
          position: 'none'
        },
      },
    },
  };

  const series = [
    {
      name: 'Efficiency',
      data: data.map((item) => ({
        x: new Date(item.date.date).getTime(),
        y: item.efficiency,
      })),
    },
  ];

  return <Chart options={options} series={series} type="bar" height="400" />;
};

export default EfficiencyChart;



