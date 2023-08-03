import React from 'react';
import Chart from 'react-apexcharts';

const processData = (data) => {
  const processedData = {};
  const processNames = new Set();

  data.forEach(entry => {
    const { date, processName, efficiency } = entry;
    processNames.add(processName);

    if (!processedData[date]) {
      processedData[date] = {};
    }

    processedData[date][processName] = efficiency;
  });

  const categories = Object.keys(processedData);
  const series = Array.from(processNames).map(processName => ({
    name: processName,
    data: [categories.reduce((sum, date) => sum + (processedData[date][processName] || 0), 0)]
  }));

  return {
    categories,
    series
  };
};

const ChartComponent = ({ data }) => {
  const { categories, series } = processData(data);

  const options = {
    chart: {
      type: 'bar',
      stacked: false,
      height: 350,
    },
    xaxis: {
      categories: categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: '13px'
        }
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
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      offsetX: 40
    }
  };

  return (
    <Chart options={options} series={series} type="bar" height={350} />
  );
};

export default ChartComponent;
