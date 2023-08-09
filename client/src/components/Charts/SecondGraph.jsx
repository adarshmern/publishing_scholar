import React from 'react';
import ReactApexChart from 'react-apexcharts';

const DateEfficiencyChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <div>No data available</div>;
    }
  const categories = data.map(item => item.date);

  const preEditingSeries = data.map(item => {
    const preEditingEntry = item.data.find(entry => entry.processName === 'Pre Editing');
    return preEditingEntry ? preEditingEntry.efficiency : null;
  });

  const copyEditingSeries = data.map(item => {
    const copyEditingEntry = item.data.find(entry => entry.processName === 'Copy Editing');
    return copyEditingEntry ? copyEditingEntry.efficiency : null;
  });

  const series = [
    {
      name: 'Pre Editing',
      data: preEditingSeries,
    },
    {
      name: 'Copy Editing',
      data: copyEditingSeries,
    },
  ];

  const options = {
    chart: {
      type: 'bar',
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: categories,
      title: {
        text: 'Dates',
      },
    },
    yaxis: {
      title: {
        text: 'Efficiency',
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (value, { seriesIndex, dataPointIndex }) => {
          const pagecount = data[dataPointIndex].data[seriesIndex].pageCount;
          const workbookCount = data[dataPointIndex].data[seriesIndex].workbookCount;
          const efficiency = value.toFixed(2);
          return `Efficiency: ${efficiency}\nPage Count: ${pagecount} \n WorkBookCount ${workbookCount}`;
        },
      },
    },
  };

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

export default DateEfficiencyChart;
